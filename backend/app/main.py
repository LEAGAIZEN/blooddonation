"""
main.py — FastAPI application entry point.
Frontend integration: users.py bridges all frontend-facing URLs.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.models import Base

# ROUTERS
from app.routes.auth_routes import router as auth_router

from app.routes import (
    auth,
    donor,
    seeker,
    eligibility,
    availability,
    camp,
    camp_registration,
    geo,
    chat,
    users,
)

# CREATE DATABASE TABLES
Base.metadata.create_all(bind=engine)

# FASTAPI APP
app = FastAPI(
    title="Blood Donation Management System",
    description="API for managing blood donors, seekers, camps, geolocation and AI chat.",
    version="1.0.0",
)

# CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# INCLUDE ROUTERS
# ─────────────────────────────────────────────

# AUTH ROUTES
app.include_router(auth_router)

# FRONTEND BRIDGE ROUTES
app.include_router(users.router)

# CORE ROUTES
app.include_router(auth.router)
app.include_router(donor.router)
app.include_router(seeker.router)
app.include_router(eligibility.router)
app.include_router(availability.router)
app.include_router(camp.router)
app.include_router(camp_registration.router)
app.include_router(geo.router)
app.include_router(chat.router)

# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():

    return {
        "status": "ok",
        "message": "BDMS API is running"
    }


# ─────────────────────────────────────────────
# TEST DONOR DATABASE ROUTE
# ─────────────────────────────────────────────

@app.get("/donor")
def get_donors():

    with engine.connect() as conn:

        result = conn.execute(
            text("SELECT * FROM donors")
        )

        return [
            dict(row._mapping)
            for row in result
        ]