"""
geo.py — Geolocation utilities for the Blood Donation Management System.

Uses the Haversine formula for accurate great-circle distance calculation.
No external API key required for distance math; optional reverse-geocoding
via Nominatim (OpenStreetMap) is available at zero cost.

Key feature: find donors / seekers / camps within a configurable radius
(default 5 km) of a given lat/lon.
"""

import math
import httpx
from typing import Optional

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Return the great-circle distance in km between two (lat, lon) points.
    Uses the Haversine formula — accurate to within ~0.5 % for distances < 1000 km.
    """
    r = EARTH_RADIUS_KM
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(a))


def filter_within_radius(items, user_lat: float, user_lon: float, radius_km: float = 5.0):
    """
    Filter a list of ORM objects (Donor / Seeker / Camp) to those whose
    .latitude/.longitude fall within `radius_km` of (user_lat, user_lon).

    Returns list of (item, distance_km) tuples sorted nearest-first.
    Items with NULL lat/lon are excluded.
    """
    results = []
    for item in items:
        if item.latitude is None or item.longitude is None:
            continue
        dist = haversine_km(user_lat, user_lon, item.latitude, item.longitude)
        if dist <= radius_km:
            results.append((item, round(dist, 3)))

    results.sort(key=lambda x: x[1])
    return results


async def reverse_geocode(latitude: float, longitude: float) -> Optional[str]:
    """
    Convert (lat, lon) → human-readable address using the free Nominatim API.
    Returns None on any error so the caller can fall back gracefully.

    NOTE: Nominatim's usage policy requires a unique User-Agent and limits
    requests to 1 req/sec. For production, use a paid provider or cache results.
    """
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": latitude,
        "lon": longitude,
        "format": "json",
    }
    headers = {"User-Agent": "BDMS/1.0 (blood-donation-management-system)"}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data.get("display_name")
    except Exception:
        return None


async def forward_geocode(address: str) -> Optional[dict]:
    """
    Convert a free-text address → {latitude, longitude} using Nominatim.
    Returns None on failure.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": address,
        "format": "json",
        "limit": 1,
    }
    headers = {"User-Agent": "BDMS/1.0 (blood-donation-management-system)"}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            results = resp.json()
            if not results:
                return None
            top = results[0]
            return {
                "latitude": float(top["lat"]),
                "longitude": float(top["lon"]),
                "display_name": top.get("display_name"),
            }
    except Exception:
        return None
