from fastapi import APIRouter, HTTPException, status
from auth.schemas.auth import SignupRequest, LoginRequest
from auth.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
async def signup(user_data: SignupRequest):
    result = await AuthService.signup(user_data)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@router.post("/login")
async def login(login_data: LoginRequest):
    result = await AuthService.login(login_data)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return result
