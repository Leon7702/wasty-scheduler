from sqlalchemy import create_engine # function to connect sqlalchemy to a database
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database (local file: scheduler.db)
DATABASE_URL = "sqlite:///./scheduler.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # creates a new session, which will be used for each request

Base = declarative_base()