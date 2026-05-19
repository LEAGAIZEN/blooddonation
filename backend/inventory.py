from fastapi import APIRouter
from sqlalchemy import text
from app.database import engine

router = APIRouter()

# low stock alert
@router.get("/inventory/low-stock")
def low_stock():

    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM inventory WHERE units < 5")
        )

        return [dict(row._mapping) for row in result]