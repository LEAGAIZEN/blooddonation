"""
schemas.py — Pydantic request/response models.
Bugs fixed:
  - Removed triplicate `from pydantic import BaseModel` / `from datetime import ...` imports
  - Fixed SeekerCreate being accidentally nested inside EligibilityCheck (wrong indentation)
  - Added OTPVerify schema that was referenced in auth.py but never defined
  - Added optional latitude/longitude to Donor, Seeker, Camp schemas for geolocation
"""

from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "user"          # defaults to regular user


class UserLogin(BaseModel):
    email: str
    password: str


class OTPVerify(BaseModel):
    email: str
    otp: str


# ─── Donor ───────────────────────────────────────────────────────────────────

class DonorCreate(BaseModel):
    blood_group: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DonorUpdate(BaseModel):
    blood_group: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DonorResponse(BaseModel):
    id: int
    user_id: int
    blood_group: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    available: bool

    class Config:
        orm_mode = True


# ─── Seeker ──────────────────────────────────────────────────────────────────

class SeekerCreate(BaseModel):        # BUG FIX: was accidentally nested inside EligibilityCheck
    blood_group: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SeekerUpdate(BaseModel):
    blood_group: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str


class SeekerResponse(BaseModel):
    id: int
    user_id: int
    blood_group: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    status: str

    class Config:
        orm_mode = True


# ─── Eligibility ─────────────────────────────────────────────────────────────

class EligibilityCheck(BaseModel):
    last_donation_date: date
    health_status: bool


# ─── Camp ────────────────────────────────────────────────────────────────────

class CampCreate(BaseModel):
    title: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    camp_date: date
    description: str


class CampResponse(BaseModel):
    id: int
    title: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    camp_date: date
    description: str
    status: str

    class Config:
        orm_mode = True


# ─── Camp Registration ────────────────────────────────────────────────────────

class CampRegister(BaseModel):
    donor_id: int
    camp_id: int


class CampRegisterResponse(BaseModel):
    id: int
    donor_id: int
    camp_id: int
    registered_at: datetime

    class Config:
        orm_mode = True


# ─── Geolocation ─────────────────────────────────────────────────────────────

class NearbySearchRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 5.0
    blood_group: Optional[str] = None    # filter by blood group if provided


class NearbyResult(BaseModel):
    id: int
    blood_group: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    distance_km: float
    available: Optional[bool] = None    # only for donors

    class Config:
        orm_mode = True


# ─── AI Chat ─────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str           # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
