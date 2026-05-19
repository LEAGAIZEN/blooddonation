from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User
from app.schemas import UserCreate, UserLogin

from app.auth import (
    hash_password,
    verify_password,
    create_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# SIGNUP
# =========================

@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    # Check existing email
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user
    new_user = User(
        fullName=user.fullName,
        email=user.email,
        phone=user.phone,
        bloodGroup=user.bloodGroup,
        password=hashed_password
    )

    # Save user
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Signup successful"
    }


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Verify password
    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    # Create JWT token
    token = create_token({
        "user_id": db_user.id,
        "email": db_user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }