from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# PostgreSQL database connection
# Example:
# postgresql://username:password@localhost:5432/blood_donation_db
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://evyaanyadav@localhost:5432/blood_donation_db"
)

# Create database engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

# Create database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model for SQLAlchemy
Base = declarative_base()


def get_db():
    """
    Create and close database session automatically.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
