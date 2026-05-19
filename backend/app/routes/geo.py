"""
routes/geo.py — Geolocation endpoints.

Provides:
  POST /geo/nearby-donors  — available donors within N km (default 5) by blood group
  POST /geo/nearby-seekers — active blood requests within N km
  POST /geo/nearby-camps   — upcoming camps within N km
  GET  /geo/geocode        — forward geocode an address → lat/lon (Nominatim)
  GET  /geo/reverse        — reverse geocode lat/lon → address (Nominatim)
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Donor, Seeker, Camp
from app.schemas import NearbySearchRequest, NearbyResult
from app.geo import filter_within_radius, forward_geocode, reverse_geocode

router = APIRouter(prefix="/geo", tags=["Geolocation"])


@router.post("/nearby-donors", response_model=list[NearbyResult])
def nearby_donors(
    search: NearbySearchRequest,
    db: Session = Depends(get_db),
):
    """
    Find available donors within `radius_km` (default 5 km) of a coordinate.
    Optionally filter by blood group.
    """
    query = db.query(Donor).filter(Donor.available == True)

    if search.blood_group:
        query = query.filter(Donor.blood_group == search.blood_group)

    donors = query.all()
    nearby = filter_within_radius(donors, search.latitude, search.longitude, search.radius_km)

    return [
        NearbyResult(
            id=d.id,
            blood_group=d.blood_group,
            location=d.location,
            latitude=d.latitude,
            longitude=d.longitude,
            distance_km=dist,
            available=d.available,
        )
        for d, dist in nearby
    ]


@router.post("/nearby-seekers", response_model=list[NearbyResult])
def nearby_seekers(
    search: NearbySearchRequest,
    db: Session = Depends(get_db),
):
    """
    Find pending blood requests within `radius_km` of a coordinate.
    Optionally filter by blood group.
    """
    query = db.query(Seeker).filter(Seeker.status == "pending")

    if search.blood_group:
        query = query.filter(Seeker.blood_group == search.blood_group)

    seekers = query.all()
    nearby = filter_within_radius(seekers, search.latitude, search.longitude, search.radius_km)

    return [
        NearbyResult(
            id=s.id,
            blood_group=s.blood_group,
            location=s.location,
            latitude=s.latitude,
            longitude=s.longitude,
            distance_km=dist,
        )
        for s, dist in nearby
    ]


@router.post("/nearby-camps", response_model=list[NearbyResult])
def nearby_camps(
    search: NearbySearchRequest,
    db: Session = Depends(get_db),
):
    """
    Find upcoming blood donation camps within `radius_km` of a coordinate.
    """
    camps = db.query(Camp).filter(Camp.status == "upcoming").all()
    nearby = filter_within_radius(camps, search.latitude, search.longitude, search.radius_km)

    return [
        NearbyResult(
            id=c.id,
            blood_group="any",           # camps accept all blood groups
            location=c.location,
            latitude=c.latitude,
            longitude=c.longitude,
            distance_km=dist,
        )
        for c, dist in nearby
    ]


@router.get("/geocode")
async def geocode_address(address: str = Query(..., description="Address to geocode")):
    """Convert a place name / address to latitude and longitude."""
    result = await forward_geocode(address)
    if not result:
        return {"error": "Address not found"}
    return result


@router.get("/reverse")
async def reverse_geocode_coords(
    latitude: float = Query(...),
    longitude: float = Query(...),
):
    """Convert latitude/longitude to a human-readable address."""
    address = await reverse_geocode(latitude, longitude)
    if not address:
        return {"error": "Could not resolve coordinates"}
    return {"latitude": latitude, "longitude": longitude, "address": address}
