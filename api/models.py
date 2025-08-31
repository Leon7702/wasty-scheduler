from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# defines python class that maps to the employees table
# Employee = python representation of a row in the employees table
class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)

    # One employee can have many schedules
    schedules = relationship("Schedule", back_populates="employee")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    shift = Column(String, nullable=False)   # e.g. "Morning", "Evening"
    note = Column(String, nullable=True)
    # Links schedule to employee
    employee_id = Column(Integer, ForeignKey("employees.id"))
    employee = relationship("Employee", back_populates="schedules")