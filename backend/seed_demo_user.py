"""
Seed script — creates demo paid user and fake transaction.
Run: cd backend && python seed_demo_user.py
"""
import asyncio
import hashlib
import secrets
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", os.getenv("DB_NAME", "mental_health_db"))

def hash_password(password: str) -> str:
    """Exact same algorithm as backend/core/security.py"""
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${hashed.hex()}"

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    users_col = db["users"]
    transactions_col = db["transactions"]

    email = "sakibnghs123@gmail.com"
    password = "111111"
    name = "Sakib (Demo Paid)"

    hashed = hash_password(password)

    existing = await users_col.find_one({"email": email})
    if existing:
        await users_col.update_one(
            {"email": email},
            {"$set": {
                "user_type": "paid",
                "hashed_password": hashed,
                "is_active": True,
                "subscription": "premium",
                "subscription_expiry": datetime(2027, 12, 31),
                "updated_at": datetime.utcnow()
            }}
        )
        user_id = str(existing["_id"])
        print(f"✅ Updated existing user: {email} → paid")
    else:
        result = await users_col.insert_one({
            "name": name,
            "email": email,
            "hashed_password": hashed,
            "is_active": True,
            "user_type": "paid",
            "is_admin": False,
            "subscription": "premium",
            "subscription_expiry": datetime(2027, 12, 31),
            "created_at": datetime.utcnow()
        })
        user_id = str(result.inserted_id)
        print(f"✅ Created demo paid user: {email}")

    existing_tx = await transactions_col.find_one({"user_email": email, "status": "success"})
    if not existing_tx:
        await transactions_col.insert_one({
            "tran_id": "DEMO_TXN_2024_001",
            "user_id": user_id,
            "user_name": name,
            "user_email": email,
            "amount": 299,
            "currency": "BDT",
            "plan": "premium_monthly",
            "payment_method": "bKash",
            "status": "success",
            "val_id": "DEMO_VAL_001",
            "card_brand": "Mobile Banking",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print(f"✅ Inserted fake bKash transaction (৳299) for {email}")
    else:
        print(f"ℹ️  Transaction already exists for {email}")

    print("\n📋 Demo credentials:")
    print(f"   Email   : {email}")
    print(f"   Password: {password}")
    print(f"   Type    : paid / premium")
    print("\n🔑 Admin panel Payments tab will show this transaction.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
