"""
models.py — single source of truth for all SQLAlchemy ORM models.
Previously the codebase had duplicate User/Seeker/Donor class definitions
across BDMS/models.py and BDMS/app/models.py with conflicting imports
(some used `from database import Base`, others `from app.database import Base`).
All models are consolidated here.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="user")       # "user" | "admin"
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)

    # OTP fields for 2-step login
    otp = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)

    donors = relationship("Donor", back_populates="user")
    seekers = relationship("Seeker", back_populates="user")


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blood_group = Column(String, nullable=False)
    location = Column(String, nullable=False)
    age = Column(String, nullable=True)
    weight = Column(String, nullable=True)

    # Geolocation — stored as decimal degrees
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Availability toggle
    available = Column(Boolean, default=True)

    user = relationship("User", back_populates="donors")


class Seeker(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blood_group = Column(String, nullable=False)
    location = Column(String, nullable=False)

    # Geolocation — stored as decimal degrees
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    status = Column(String, default="pending")  # "pending" | "fulfilled"

    user = relationship("User", back_populates="seekers")


class Camp(Base):
    __tablename__ = "camps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=False)

    # Geolocation
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    camp_date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="upcoming")  # "upcoming" | "completed" | "cancelled"

    registrations = relationship("CampRegistration", back_populates="camp")


class CampRegistration(Base):
    __tablename__ = "camp_registrations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"), nullable=False)
    camp_id = Column(Integer, ForeignKey("camps.id"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)

    camp = relationship("Camp", back_populates="registrations")
