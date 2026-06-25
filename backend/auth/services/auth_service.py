from datetime import datetime
from bson import ObjectId
from core.database import db
from core.security import hash_password, verify_password, create_token
from auth.schemas.auth import SignupRequest, LoginRequest

USER_COLLECTION = "users"


class AuthService:

    @staticmethod
    async def signup(user_data: SignupRequest):
        # ইমেইল চেক করুন
        existing = await db.get_collection(USER_COLLECTION).find_one({
            "email": user_data.email.lower()
        })

        if existing:
            return {
                "success": False,
                "message": "এই ইমেইলে already একটি একাউন্ট আছে"
            }

        # পাসওয়ার্ড হ্যাশ করুন
        hashed = hash_password(user_data.password)

        # ইউজার তৈরি করুন
        user_doc = {
            "name": user_data.name,
            "email": user_data.email.lower(),
            "hashed_password": hashed,
            "is_active": True,
            "user_type": "free",
            "created_at": datetime.utcnow()
        }

        result = await db.get_collection(USER_COLLECTION).insert_one(user_doc)

        # টোকেন তৈরি করুন
        token = create_token({"sub": str(result.inserted_id), "email": user_data.email})

        return {
            "success": True,
            "message": "🎉 একাউন্ট সফলভাবে তৈরি হয়েছে!",
            "user": {
                "id": str(result.inserted_id),
                "name": user_data.name,
                "email": user_data.email,
                "is_active": True,
                "user_type": "free",
                "is_admin": False
            },
            "token": token
        }

    @staticmethod
    async def login(login_data: LoginRequest):
        # ইউজার খুঁজুন
        user = await db.get_collection(USER_COLLECTION).find_one({
            "email": login_data.email.lower()
        })

        if not user:
            return {
                "success": False,
                "message": "ইমেইল বা পাসওয়ার্ড ভুল"
            }

        # পাসওয়ার্ড চেক করুন
        if not verify_password(login_data.password, user["hashed_password"]):
            return {
                "success": False,
                "message": "ইমেইল বা পাসওয়ার্ড ভুল"
            }

        # টোকেন তৈরি করুন
        token = create_token({"sub": str(user["_id"]), "email": user["email"]})

        return {
            "success": True,
            "message": "✅ লগইন সফল!",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "is_active": user.get("is_active", True),
                "user_type": user.get("user_type", "free"),
                "is_admin": user.get("is_admin", False)
            },
            "token": token
        }

    @staticmethod
    async def upgrade_user(user_id: str):
        result = await db.get_collection(USER_COLLECTION).update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"user_type": "paid"}}
        )
        if result.modified_count:
            return {"success": True, "message": "User upgraded successfully"}
        return {"success": False, "message": "User not found or already upgraded"}