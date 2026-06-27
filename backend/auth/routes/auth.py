from fastapi import APIRouter, HTTPException, status
from auth.schemas.auth import SignupRequest, LoginRequest
from auth.services.auth_service import AuthService
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from core.database import db
from core.security import create_token
from auth.routes.auth_otp import router as otp_router

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Include OTP routes nested inside /auth prefix
router.include_router(otp_router)

class GoogleLoginRequest(BaseModel):
    email: str
    name: str
    token: Optional[str] = None

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

@router.post("/google")
async def google_login(data: GoogleLoginRequest):
    email_lower = data.email.lower().strip()
    if not email_lower:
        raise HTTPException(status_code=400, detail="ইমেইল প্রয়োজন")
        
    user = await db.get_collection("users").find_one({"email": email_lower})
    
    if not user:
        # Register user on the fly if this email does not exist
        user_doc = {
            "name": data.name,
            "email": email_lower,
            "hashed_password": "",  # Passwordless login
            "is_active": True,
            "user_type": "free",
            "is_admin": False,
            "created_at": datetime.utcnow()
        }
        result = await db.get_collection("users").insert_one(user_doc)
        user = user_doc
        user["_id"] = result.inserted_id
        
    user_id = str(user["_id"])
    token = create_token({"sub": user_id, "email": user["email"]})
    
    return {
        "success": True,
        "message": "গুগল লগইন সফল হয়েছে!",
        "token": token,
        "user": {
            "id": user_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "is_active": user.get("is_active", True),
            "user_type": user.get("user_type", "free"),
            "is_admin": user.get("is_admin", False)
        }
    }

