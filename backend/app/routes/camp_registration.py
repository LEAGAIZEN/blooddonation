"""
routes/camp_registration.py — Donor registration for blood donation camps.
Note: original file was named camp_registeration.py (typo). Renamed.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Donor, Camp, CampRegistration
from app.schemas import CampRegister, CampRegisterResponse
from app.auth import get_current_user_id

router = APIRouter(prefix="/camp-registration", tags=["Camp Registration"])


@router.post("/", response_model=CampRegisterResponse)
def register_for_camp(
    data: CampRegister,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    # Validate donor belongs to requesting user
    donor = db.query(Donor).filter(Donor.id == data.donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    if donor.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your donor profile")

    # Validate camp exists
    camp = db.query(Camp).filter(Camp.id == data.camp_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Camp not found")

    # Prevent duplicate registration
    existing = db.query(CampRegistration).filter(
        CampRegistration.donor_id == data.donor_id,
        CampRegistration.camp_id == data.camp_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this camp")

    reg = CampRegistration(donor_id=data.donor_id, camp_id=data.camp_id)
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@router.get("/camp/{camp_id}", response_model=list[CampRegisterResponse])
def get_camp_registrations(camp_id: int, db: Session = Depends(get_db)):
    """List all donors registered for a given camp."""
    return db.query(CampRegistration).filter(CampRegistration.camp_id == camp_id).all()


@router.delete("/{registration_id}")
def cancel_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    reg = db.query(CampRegistration).filter(CampRegistration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Verify ownership via donor
    donor = db.query(Donor).filter(Donor.id == reg.donor_id).first()
    if not donor or donor.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your registration")

    db.delete(reg)
    db.commit()
    return {"message": "Registration cancelled"}
