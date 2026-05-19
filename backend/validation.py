from fastapi import APIRouter

router = APIRouter()

@router.post("/validate")
def validate_units(units: int):

    if units <= 0:
        return {"message": "Units must be greater than 0"}

    return {"message": "Valid input"}