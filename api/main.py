from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date

from . import models
from .database import Base, engine, SessionLocal
from pydantic import BaseModel

# Create tables by reading the models
Base.metadata.create_all(bind=engine)

# FastAPI app instance
app = FastAPI(title="Wasty Scheduler API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creates new database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---

# Expected data of the client
class EmployeeIn(BaseModel):
    name: str
    role: str

# Data sent to the client (inherits from EmployeeIn)
class EmployeeOut(EmployeeIn):
    id: int
    class Config:
        from_attributes = True # Normally expects a dict, now allows SQLAlchemy objects

# Schedule input data
class ScheduleIn(BaseModel):
    employee_id: int
    date: date
    shift: str
    note: str | None = None

# Data sent to the client (inherits from ScheduleIn)
class ScheduleOut(ScheduleIn):
    id: int
    class Config:
        from_attributes = True

# Analytics item data
class AnalyticsItem(BaseModel):
    employee_id: int
    employee_name: str
    total_shifts: int

# Response model for analytics
class AnalyticsResponse(BaseModel):
    items: list[AnalyticsItem]
    total_shifts_all: int

# --- Routes ---

# Get all rows from employees table
# Returns them as a list of EmployeeOut JSON objects
@app.get("/employees", response_model=List[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

# Create a new employee
# Returns the created employee as an EmployeeOut JSON object
@app.post("/employees", response_model=EmployeeOut, status_code=201)
def create_employee(emp: EmployeeIn, db: Session = Depends(get_db)):
    new_emp = models.Employee(name=emp.name, role=emp.role)
    db.add(new_emp) # mark for addition
    db.commit() # persist changes
    db.refresh(new_emp) # reload objects from db
    return new_emp

# Update an existing employee
@app.put("/employees/{emp_id}", response_model=EmployeeOut)
def update_employee(emp_id: int, emp: EmployeeIn, db: Session = Depends(get_db)):
    existing = db.query(models.Employee).filter(models.Employee.id == emp_id).first() # Queries DB for employee ID
    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")
    existing.name = emp.name # Update fields
    existing.role = emp.role # Update fields
    db.commit()
    db.refresh(existing)
    return existing

# Delete an employee
@app.delete("/employees/{emp_id}", status_code=204)
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    existing = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(existing)
    db.commit()
    return

# List schedules with optional date range filtering
@app.get("/schedule", response_model=List[ScheduleOut])
def list_schedule(
    start: date | None = Query(default=None, description="Inclusive start date (YYYY-MM-DD)"),
    end:   date | None = Query(default=None, description="Inclusive end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Schedule)
    # Ignore corrupted rows without employee_id to keep response valid
    q = q.filter(models.Schedule.employee_id != None)
    if start is not None:
        q = q.filter(models.Schedule.date >= start)
    if end is not None:
        q = q.filter(models.Schedule.date <= end)
    return q.order_by(models.Schedule.date.asc(), models.Schedule.id.asc()).all()

# Create a new schedule
@app.post("/schedule", response_model=ScheduleOut, status_code=201)
def create_schedule(s: ScheduleIn, db: Session = Depends(get_db)):
    # Validate employee exists
    emp = db.query(models.Employee).filter(models.Employee.id == s.employee_id).first()
    if not emp:
        raise HTTPException(status_code=400, detail="Employee not found")

    new_s = models.Schedule(
        employee_id=s.employee_id,
        date=s.date,
        shift=s.shift,
        note=s.note,
    )
    db.add(new_s)
    db.commit()
    db.refresh(new_s)
    return new_s

# Update an existing schedule
@app.put("/schedule/{sid}", response_model=ScheduleOut)
def update_schedule(sid: int, s: ScheduleIn, db: Session = Depends(get_db)):
    sched = db.query(models.Schedule).filter(models.Schedule.id == sid).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")

    sched.employee_id = s.employee_id
    sched.date = s.date
    sched.shift = s.shift
    sched.note = s.note
    db.commit()
    db.refresh(sched)
    return sched

# Delete an existing schedule
@app.delete("/schedule/{sid}", status_code=204)
def delete_schedule(sid: int, db: Session = Depends(get_db)):
    sched = db.query(models.Schedule).filter(models.Schedule.id == sid).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(sched)
    db.commit()
    return

# Get Analytics data
@app.get("/analytics", response_model=AnalyticsResponse)
def analytics(
    start: date | None = Query(default=None, description="Inclusive start date (YYYY-MM-DD)"),
    end:   date | None = Query(default=None, description="Inclusive end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    # Base query: SELECT emp.id, emp.name, COUNT(s.id)
    q = (
        db.query(
            models.Employee.id.label("employee_id"),
            models.Employee.name.label("employee_name"),
            func.count(models.Schedule.id).label("total_shifts")
        )
        .outerjoin(models.Schedule, models.Schedule.employee_id == models.Employee.id)
        .group_by(models.Employee.id, models.Employee.name)
    )

    # If date filters provided, constrain the joined schedules
    if start is not None:
        q = q.filter((models.Schedule.date == None) | (models.Schedule.date >= start))  # None when no schedule row in outer join
    if end is not None:
        q = q.filter((models.Schedule.date == None) | (models.Schedule.date <= end))

    rows = q.all()

    items = [
        AnalyticsItem(
            employee_id=r.employee_id,
            employee_name=r.employee_name,
            total_shifts=int(r.total_shifts or 0),
        )
        for r in rows
    ]
    total_all = sum(i.total_shifts for i in items)

    return AnalyticsResponse(items=items, total_shifts_all=total_all)
