from fastapi import APIRouter

router = APIRouter()

@router.get("/notifications")
def get_notifications():
    return {"notifications": []}
