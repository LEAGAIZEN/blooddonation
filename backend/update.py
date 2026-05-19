from fastapi import APIRouter
from sqlalchemy import text
from app.database import engine

router = APIRouter()

# update request
@router.put("/request/{id}")
def update_request(id: int):
    with engine.connect() as conn:
        conn.execute(
            text("UPDATE requests SET status = 'completed' WHERE id = :id"),
            {"id": id}
        )
        conn.commit()
    return {"message": "Request updated"}

# update inventory
@router.put("/inventory/{id}")
def update_inventory(id: int, units: int):
    with engine.connect() as conn:
        conn.execute(
            text("UPDATE inventory SET units = :units WHERE id = :id"),
            {"units": units, "id": id}
        )
        conn.commit()
    return {"message": "Inventory updated"}