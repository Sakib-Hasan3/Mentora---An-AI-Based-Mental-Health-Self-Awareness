from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import random
from datetime import datetime, timedelta
from bson import ObjectId

from core.database import db
from core.security import create_token

router = APIRouter(prefix="/otp", tags=["OTP Authentication"])

OTP_COLLECTION = "otps"
USER_COLLECTION = "users"

class OTPSendRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

@router.post("/send")
async def send_otp(request: OTPSendRequest):
    phone = request.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="ফোন নম্বর প্রয়োজন")

    # Clean phone number (keep only digits and optional + at start)
    phone_cleaned = "".join([c for c in phone if c.isdigit() or c == '+'])
    
    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    
    # Expiry in 5 minutes
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Save to DB (overwrite existing OTP for this phone)
    await db.get_collection(OTP_COLLECTION).update_one(
        {"phone": phone_cleaned},
        {
            "$set": {
                "otp": otp_code,
                "expires_at": expires_at,
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )
    
    # Log to backend terminal
    print("\n" + "="*50)
    print(f"📱 [OTP SERVICE] SMS simulation:")
    print(f"   To: {phone_cleaned}")
    print(f"   Message: মেন্টাল সাথী-তে লগইনের জন্য ওটিপি কোড: {otp_code}")
    print("="*50 + "\n")
    
    return {
        "success": True,
        "message": "ওটিপি সফলভাবে পাঠানো হয়েছে",
        "debug_otp": otp_code  # Returned for easy local verification
    }

@router.post("/verify")
async def verify_otp(request: OTPVerifyRequest):
    phone = request.phone.strip()
    otp = request.otp.strip()
    
    phone_cleaned = "".join([c for c in phone if c.isdigit() or c == '+'])
    
    # Find active OTP
    record = await db.get_collection(OTP_COLLECTION).find_one({
        "phone": phone_cleaned,
        "otp": otp,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not record:
        raise HTTPException(status_code=400, detail="ওটিপি কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে")
        
    # Delete OTP after verification to prevent reuse
    await db.get_collection(OTP_COLLECTION).delete_one({"_id": record["_id"]})
    
    # Find user by phone number
    user = await db.get_collection(USER_COLLECTION).find_one({"phone": phone_cleaned})
    
    if not user:
        # Create a new user account if this phone number is logging in for the first time
        user_doc = {
            "name": f"User {phone_cleaned[-4:]}",
            "email": f"phone_{phone_cleaned}@mentora.com",
            "phone": phone_cleaned,
            "hashed_password": "",  # Passwordless login
            "is_active": True,
            "user_type": "free",
            "is_admin": False,
            "created_at": datetime.utcnow()
        }
        result = await db.get_collection(USER_COLLECTION).insert_one(user_doc)
        user = user_doc
        user["_id"] = result.inserted_id
        
    user_id = str(user["_id"])
    
    # Generate token
    token = create_token({"sub": user_id, "email": user.get("email", "")})
    
    return {
        "success": True,
        "message": "লগইন সফল হয়েছে!",
        "token": token,
        "user": {
            "id": user_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "is_active": user.get("is_active", True),
            "user_type": user.get("user_type", "free"),
            "is_admin": user.get("is_admin", False)
        }
    }
