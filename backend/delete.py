from fastapi import APIRouter
from sqlalchemy import text
from app.database import engine

router = APIRouter()

# delete request
@router.delete("/request/{id}")
def delete_request(id: int):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM requests WHERE id = :id"),
            {"id": id}
        )
        conn.commit()
    return {"message": "Request deleted"}

# delete inventory
@router.delete("/inventory/{id}")
def delete_inventory(id: int):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM inventory WHERE id = :id"),
            {"id": id}
        )
        conn.commit()
    return {"message": "Inventory deleted"}

# optional donor delete
@router.delete("/donor/{id}")
def delete_donor(id: int):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM donors WHERE id = :id"),
            {"id": id}
        )
        conn.commit()
    return {"message": "Donor deleted"}