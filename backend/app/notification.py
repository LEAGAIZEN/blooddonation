from fastapi import APIRouter
from sqlalchemy import text
from database.db import engine

router = APIRouter()

# send push notification
@router.post("/notification/push")
def send_push(message: str):

    with engine.connect() as conn:

        conn.execute(
            text("""
                INSERT INTO notifications(message, type)
                VALUES (:message, 'push')
            """),
            {"message": message}
        )

        conn.commit()

    return {"message": "Push notification sent"}

# notification history
@router.get("/notifications")
def get_notifications():

    with engine.connect() as conn:

        result = conn.execute(
            text("SELECT * FROM notifications")
        )

        return [dict(row._mapping) for row in result]