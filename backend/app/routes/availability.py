"""
routes/availability.py — Toggle / check donor availability.

Bug fixed:
  - Original returned plain dict {"message": "Donor not found"} with 200 OK;
    should raise HTTPException 404 for proper API semantics.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Donor
from app.auth import get_current_user_id

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.put("/{donor_id}")
def set_availability(
    donor_id: int,
    available: bool,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")   # BUG FIX: was returning 200
    if donor.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your donor profile")

    donor.available = available
    db.commit()

    return {"donor_id": donor_id, "available": donor.available}


@router.get("/{donor_id}")
def get_availability(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")   # BUG FIX

    return {"donor_id": donor_id, "available": donor.available}
