from datetime import datetime, timezone
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, EmailStr
from core.database import db
from core.security import hash_password, create_token, decode_token
from core.email import email_service
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Email Verification & Password Reset"])
logger = logging.getLogger(__name__)

# ─── Schemas ──────────────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

# ─── Endpoints ─────────────────────────────────────────────────────────────

@router.get("/verify-email")
async def verify_email(token: str = Query(..., description="The verification token sent via email")):
    """
    Verifies a user's email address using the token.
    Sets is_verified and is_active to True.
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ভেরিফিকেশন লিঙ্কটি অবৈধ বা মেয়াদোত্তীর্ণ হয়েছে।"
        )
    
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ভেরিফিকেশন টোকেনে কোনো ইমেইল পাওয়া যায়নি।"
        )
    
    # Update user status in database
    users_col = db.get_collection("users")
    user = await users_col.find_one({"email": email.lower().strip()})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="কোনো ইউজার পাওয়া যায়নি।"
        )
        
    if user.get("is_verified", False):
        return {
            "success": True,
            "message": "আপনার ইমেইলটি ইতিপূর্বে ভেরিফাই করা হয়েছে!"
        }
        
    await users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"is_verified": True, "is_active": True, "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Log activity
    try:
        from core.activity_logger import log_activity
        await log_activity(
            user_id=str(user["_id"]),
            action="verify_email",
            description="ইমেইল ভেরিফিকেশন সফল হয়েছে",
            ip="N/A",
            user_agent="N/A"
        )
    except Exception:
        pass
        
    return {
        "success": True,
        "message": "অভিনন্দন! আপনার ইমেইল সফলভাবে ভেরিফাই করা হয়েছে।"
    }

@router.post("/resend-verification")
async def resend_verification(data: ResendVerificationRequest):
    """
    Resends the email verification link if the user is unverified.
    """
    email_clean = data.email.lower().strip()
    user = await db.get_collection("users").find_one({"email": email_clean})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।"
        )
        
    if user.get("is_verified", False):
        return {
            "success": True,
            "message": "এই অ্যাকাউন্টটি ইতিপূর্বে ভেরিফাই করা হয়েছে।"
        }
        
    # Generate verification token (expires in 15m)
    token = create_token({"email": email_clean}, expires_delta=15)
    
    await email_service.send_verification_email(
        to_email=email_clean,
        name=user.get("name", "ব্যবহারকারী"),
        token=token
    )
    
    return {
        "success": True,
        "message": "ভেরিফিকেশন লিঙ্কটি পুনরায় আপনার ইমেইলে পাঠানো হয়েছে।"
    }

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """
    Generates a password reset token and sends it to the user's email.
    """
    email_clean = data.email.lower().strip()
    user = await db.get_collection("users").find_one({"email": email_clean})
    
    if not user:
        # Prevent user enumeration by returning generic success (production security best practice)
        # However, for better UX we can return success but log it internally.
        logger.info("Forgot password requested for non-existing email: %s", email_clean)
        return {
            "success": True,
            "message": "যদি ইমেইলটি আমাদের সিস্টেমে থাকে, তবে একটি পাসওয়ার্ড রিসেট করার লিঙ্ক পাঠানো হয়েছে।"
        }
        
    # Generate token (expires in 15 mins)
    token = create_token({"sub": str(user["_id"]), "email": email_clean}, expires_delta=15)
    
    # Save reset request to DB
    reset_doc = {
        "user_id": str(user["_id"]),
        "email": email_clean,
        "token": token,
        "used": False,
        "created_at": datetime.now(timezone.utc)
    }
    await db.get_collection("password_resets").insert_one(reset_doc)
    
    # Send email
    await email_service.send_password_reset_email(
        to_email=email_clean,
        name=user.get("name", "ব্যবহারকারী"),
        token=token
    )
    
    # Log activity
    try:
        from core.activity_logger import log_activity
        await log_activity(
            user_id=str(user["_id"]),
            action="forgot_password_request",
            description="পাসওয়ার্ড রিসেটের অনুরোধ করা হয়েছে",
            ip="N/A",
            user_agent="N/A"
        )
    except Exception:
        pass
        
    return {
        "success": True,
        "message": "পাসওয়ার্ড রিসেট করার লিঙ্কটি আপনার ইমেইলে পাঠানো হয়েছে।"
    }

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """
    Resets the password if the token is valid.
    """
    # 1. Decode JWT Token to verify validity
    payload = decode_token(data.token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="পাসওয়ার্ড রিসেট লিঙ্কটি অবৈধ বা মেয়াদোত্তীর্ণ হয়েছে।"
        )
        
    # 2. Check token in DB
    reset_record = await db.get_collection("password_resets").find_one({
        "token": data.token,
        "used": False
    })
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="পাসওয়ার্ড রিসেট লিঙ্কটি ইতিপূর্বে ব্যবহার করা হয়েছে।"
        )
        
    user_id = reset_record["user_id"]
    
    # 3. Hash password and update user
    hashed = hash_password(data.password)
    users_col = db.get_collection("users")
    
    result = await users_col.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": hashed, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="কোনো ইউজার পাওয়া যায়নি।"
        )
        
    # Mark token as used
    await db.get_collection("password_resets").update_one(
        {"_id": reset_record["_id"]},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}}
    )
    
    # Log activity
    try:
        from core.activity_logger import log_activity
        await log_activity(
            user_id=user_id,
            action="reset_password_success",
            description="পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে",
            ip="N/A",
            user_agent="N/A"
        )
    except Exception:
        pass
        
    return {
        "success": True,
        "message": "আপনার পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"
    }
