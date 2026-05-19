from fastapi import APIRouter
from datetime import date
from app.schemas import EligibilityCheck

router = APIRouter(prefix="/eligibility", tags=["Eligibility"])


@router.post("/")
def check_eligibility(data: EligibilityCheck):
    today = date.today()
    days_since = (today - data.last_donation_date).days

    if days_since < 90:
        return {
            "eligible": False,
            "reason": f"Must wait {90 - days_since} more day(s) — last donation was {days_since} days ago (minimum 90)"
        }

    if not data.health_status:
        return {
            "eligible": False,
            "reason": "Current health status does not meet donation requirements"
        }

    return {
        "eligible": True,
        "reason": "You are eligible to donate blood",
        "days_since_last_donation": days_since,
    }
