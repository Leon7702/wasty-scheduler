from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Wasty Scheduler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# what client sends in when creating/updating employee
class EmployeeIn(BaseModel):
    name: str
    role: str

# extends EmployeeIn and adds an id
class Employee(EmployeeIn):
    id: int

# in-memory "database" (temporary. restarting the server clears the list)
EMPLOYEES: List[Employee] = []
# counter to assign next id
_next_id = 1


# route handlers

# return all employees
@app.get("/employees", response_model=List[Employee])
def list_employees():
    return EMPLOYEES

# create a new employee
@app.post("/employees", response_model=Employee, status_code=201)
def create_employee(emp: EmployeeIn):
    global _next_id
    data = emp.model_dump() # turns EmployeeIn into a dict
    new_emp = Employee(id=_next_id, **data)
    EMPLOYEES.append(new_emp)
    _next_id += 1
    return new_emp

# update an existing employee
@app.put("/employees/{emp_id}", response_model=Employee)
def update_employee(emp_id: int, emp: EmployeeIn):
    data = emp.model_dump()        
    for i, existing in enumerate(EMPLOYEES):
        if existing.id == emp_id:
            updated = Employee(id=emp_id, **data)
            EMPLOYEES[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Employee not found")

# delete an existing employee
@app.delete("/employees/{emp_id}", status_code=204)
def delete_employee(emp_id: int):
    for i, existing in enumerate(EMPLOYEES):
        if existing.id == emp_id:
            EMPLOYEES.pop(i)
            return
    raise HTTPException(status_code=404, detail="Employee not found")