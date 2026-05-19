from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, OTPVerify
from app.auth import hash_password, verify_password, create_token, generate_otp

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/auth", tags=["Auth"])


def send_otp_email(receiver_email: str, otp: str):
    """
    Send OTP email using Gmail SMTP.
    """

    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")

    if not sender_email or not sender_password:
        print("SMTP credentials are missing.")
        return

    subject = "Blood Donation System OTP Verification"
    body = f"Your OTP is: {otp}. It will expire in 5 minutes."

    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, message.as_string())

        print(f"OTP sent successfully to {receiver_email}")

    except Exception as error:
        print("Email sending failed:", error)


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Limit total admin accounts
    if user.role == "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()

        if admin_count >= 3:
            raise HTTPException(status_code=403, detail="Maximum 3 admin accounts allowed")

    new_user = User(
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "role": new_user.role
    }


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and send OTP for normal users.
    """

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify password
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Admin login without OTP
    if user.role == "admin":
        token = create_token({
            "user_id": user.id,
            "role": user.role
        })

        return {
            "message": "Admin login successful",
            "access_token": token,
            "role": user.role
        }

    # Generate OTP for normal users
    otp = generate_otp()

    user.otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)

    db.commit()

    # Send OTP to email
    send_otp_email(user.email, otp)

    return {
        "message": "OTP sent successfully"
    }


@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    """
    Verify OTP and generate JWT token.
    """

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.otp != data.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    if user.otp_expiry is None or datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=401, detail="OTP expired")

    # Clear OTP after successful verification
    user.otp = None
    user.otp_expiry = None
    user.is_verified = True

    db.commit()

    token = create_token({
        "user_id": user.id,
        "role": user.role
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "role": user.role
    }
