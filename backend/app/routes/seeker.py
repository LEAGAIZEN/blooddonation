"""
routes/seeker.py — CRUD for blood seekers (requests).

Bugs fixed:
  - `user_id=1` hardcoded — now extracted from JWT token
  - Added ownership check on update/delete
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Seeker
from app.schemas import SeekerCreate, SeekerUpdate, SeekerResponse
from app.auth import get_current_user_id

router = APIRouter(prefix="/seekers", tags=["Seekers"])


@router.post("/", response_model=SeekerResponse)
def create_seeker(
    seeker: SeekerCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),   # BUG FIX: was hardcoded 1
):
    new_seeker = Seeker(
        user_id=user_id,
        blood_group=seeker.blood_group,
        location=seeker.location,
        latitude=seeker.latitude,
        longitude=seeker.longitude,
    )
    db.add(new_seeker)
    db.commit()
    db.refresh(new_seeker)
    return new_seeker


@router.get("/", response_model=list[SeekerResponse])
def get_all_seekers(db: Session = Depends(get_db)):
    return db.query(Seeker).all()


@router.get("/{seeker_id}", response_model=SeekerResponse)
def get_seeker(seeker_id: int, db: Session = Depends(get_db)):
    seeker = db.query(Seeker).filter(Seeker.id == seeker_id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Request not found")
    return seeker


@router.put("/{seeker_id}", response_model=SeekerResponse)
def update_seeker(
    seeker_id: int,
    data: SeekerUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    seeker = db.query(Seeker).filter(Seeker.id == seeker_id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Request not found")
    if seeker.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your request")

    seeker.blood_group = data.blood_group
    seeker.location = data.location
    seeker.latitude = data.latitude
    seeker.longitude = data.longitude
    seeker.status = data.status
    db.commit()
    db.refresh(seeker)
    return seeker


@router.delete("/{seeker_id}")
def delete_seeker(
    seeker_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    seeker = db.query(Seeker).filter(Seeker.id == seeker_id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Request not found")
    if seeker.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your request")

    db.delete(seeker)
    db.commit()
    return {"message": "Request deleted"}
