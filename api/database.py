from sqlalchemy import create_engine  # function to connect sqlalchemy to a database
from sqlalchemy.orm import sessionmaker, declarative_base

# Central database configuration for the FastAPI app
DATABASE_URL = "sqlite:///./scheduler.db"

# Create the SQLAlchemy Engine which manages DB connections
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Each request gets its own Session instance
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ORM models (Employee, Schedule) inherit from this to map to tables
Base = declarative_base()
