# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from sqlalchemy import text
# pyrefly: ignore [missing-import]
from app.database import engine

router = APIRouter()

# get audit logs
@router.get("/audit")
def get_audit_logs():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM audit_logs"))
        return [dict(row._mapping) for row in result]

# create audit log
@router.post("/audit")
def create_log(action: str):
    with engine.connect() as conn:
        conn.execute(
            text("INSERT INTO audit_logs(action) VALUES (:action)"),
            {"action": action}
        )
        conn.commit()

    return {"message": "Audit log added"}