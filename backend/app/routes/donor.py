"""
routes/donor.py — CRUD for blood donors.

Bugs fixed:
  - `user_id=1` hardcoded — now extracted from JWT token
  - Missing DELETE endpoint added
  - `available` field was referenced in availability.py but not on the model
    (now added to model and returned here)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Donor
from app.schemas import DonorCreate, DonorUpdate, DonorResponse
from app.auth import get_current_user_id

router = APIRouter(prefix="/donors", tags=["Donors"])


@router.post("/", response_model=DonorResponse)
def create_donor(
    donor: DonorCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),   # BUG FIX: was hardcoded 1
):
    new_donor = Donor(
        user_id=user_id,
        blood_group=donor.blood_group,
        location=donor.location,
        latitude=donor.latitude,
        longitude=donor.longitude,
    )
    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)
    return new_donor


@router.get("/", response_model=list[DonorResponse])
def get_all_donors(db: Session = Depends(get_db)):
    return db.query(Donor).all()


@router.get("/{donor_id}", response_model=DonorResponse)
def get_donor(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor


@router.put("/{donor_id}", response_model=DonorResponse)
def update_donor(
    donor_id: int,
    data: DonorUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    if donor.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your donor profile")

    donor.blood_group = data.blood_group
    donor.location = data.location
    donor.latitude = data.latitude
    donor.longitude = data.longitude
    db.commit()
    db.refresh(donor)
    return donor


@router.delete("/{donor_id}")
def delete_donor(
    donor_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    if donor.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your donor profile")

    db.delete(donor)
    db.commit()
    return {"message": "Donor profile deleted"}
