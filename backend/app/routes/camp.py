"""
routes/camp.py — Blood donation camp management.

Bugs fixed:
  - `return new_camp` in create_camp was blocking the rest of the file —
    get_all_camps, update_camp, delete_camp were unreachable dead code.
  - update_camp and delete_camp had their `@router.put` / `@router.delete`
    decorators accidentally indented inside the function body of create_camp.
  - update_camp returned plain dict on 404 instead of HTTPException.
  - Admin-only guard added for create / update / delete.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Camp
from app.schemas import CampCreate, CampResponse
from app.auth import require_admin

router = APIRouter(prefix="/camps", tags=["Camps"])


@router.post("/", response_model=CampResponse)
def create_camp(
    data: CampCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),          # only admins may create camps
):
    new_camp = Camp(
        title=data.title,
        location=data.location,
        latitude=data.latitude,
        longitude=data.longitude,
        camp_date=data.camp_date,
        description=data.description,
    )
    db.add(new_camp)
    db.commit()
    db.refresh(new_camp)
    return new_camp  # BUG FIX: this return was inside get_all_camps in the original,
                     # causing everything below to be unreachable


@router.get("/", response_model=list[CampResponse])
def get_all_camps(db: Session = Depends(get_db)):
    return db.query(Camp).all()


@router.get("/{camp_id}", response_model=CampResponse)
def get_camp(camp_id: int, db: Session = Depends(get_db)):
    camp = db.query(Camp).filter(Camp.id == camp_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Camp not found")
    return camp


@router.put("/{camp_id}", response_model=CampResponse)         # BUG FIX: decorator was mis-indented
def update_camp(
    camp_id: int,
    data: CampCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    camp = db.query(Camp).filter(Camp.id == camp_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Camp not found")   # BUG FIX: was returning dict

    camp.title = data.title
    camp.location = data.location
    camp.latitude = data.latitude
    camp.longitude = data.longitude
    camp.camp_date = data.camp_date
    camp.description = data.description
    db.commit()
    db.refresh(camp)
    return camp


@router.delete("/{camp_id}")                                   # BUG FIX: decorator was mis-indented
def delete_camp(
    camp_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    camp = db.query(Camp).filter(Camp.id == camp_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Camp not found")   # BUG FIX

    db.delete(camp)
    db.commit()
    return {"message": "Camp deleted"}
