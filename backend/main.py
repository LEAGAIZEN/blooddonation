from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from app.database import engine
from fastapi.middleware.cors import CORSMiddleware
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from delete import router as delete_router
from update import router as update_router
from audit import router as audit_router
from validation import router as validation_router
from notification import router as notification_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(delete_router)
app.include_router(update_router)
app.include_router(audit_router)
app.include_router(validation_router)
app.include_router(notification_router)

# ─── EMAIL CONFIG ────────────────────────────────────────
SENDER_EMAIL = "yourgmail@gmail.com"       # 👈 change this
SENDER_PASSWORD = "xxxx xxxx xxxx xxxx"    # 👈 Gmail App Password (not your real password)
# ─────────────────────────────────────────────────────────

# In-memory OTP store  { email: otp }
otp_store = {}


# ─── MODELS ──────────────────────────────────────────────
class SignupData(BaseModel):
    fullName: str
    email: str
    phone: str
    bloodGroup: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str


# ─── OTP ROUTES ──────────────────────────────────────────
@app.post("/send-otp")
def send_otp(data: OTPRequest):
    otp = str(random.randint(100000, 999999))
    otp_store[data.email] = otp

    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = data.email
        msg["Subject"] = "DonorHub - Your OTP Code"

        body = f"""
        <h2>DonorHub Verification</h2>
        <p>Your OTP code is: <strong style="font-size:24px">{otp}</strong></p>
        <p>This code expires in 5 minutes.</p>
        """
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, data.email, msg.as_string())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")

    return {"message": "OTP sent successfully"}


@app.post("/verify-otp")
def verify_otp(data: OTPVerify):
    stored = otp_store.get(data.email)
    if not stored:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new one.")
    if stored != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    del otp_store[data.email]  # clear after use
    return {"access_token": "dummy-token-replace-with-jwt", "message": "Verified successfully"}


# ─── EXISTING ROUTES ─────────────────────────────────────
@app.post("/signup")
def signup(data: SignupData):
    return {"message": "Signup successful", "data": data}

@app.post("/login")
def login(data: LoginData):
    return {"message": "Login successful"}

@app.get("/request")
def get_requests():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM requests"))
        return [dict(row._mapping) for row in result]

@app.get("/inventory")
def get_inventory():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM inventory"))
        return [dict(row._mapping) for row in result]

@app.get("/donor")
def get_donors():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM donors"))
        return [dict(row._mapping) for row in result]

@app.get("/eligibility")
def get_eligibility():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM eligibility"))
        return [dict(row._mapping) for row in result]

@app.get("/")
def root():
    return {"message": "Backend Running"}