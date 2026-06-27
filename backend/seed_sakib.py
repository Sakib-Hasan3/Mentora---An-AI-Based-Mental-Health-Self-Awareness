import asyncio
import hashlib
import secrets
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "mental_health_db")

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${hashed.hex()}"

async def run():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    users_col = db["users"]
    transactions_col = db["transactions"]
    
    email = "sakib@gmail.com"
    password = "111111"
    name = "Sakib Hasan"
    hashed = hash_password(password)
    
    existing = await users_col.find_one({"email": email})
    if existing:
        await users_col.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "name": name,
                "user_type": "paid",
                "hashed_password": hashed,
                "is_active": True,
                "subscription": "premium",
                "subscription_expiry": datetime(2027, 12, 31),
                "is_admin": True,  # Make them admin so they can access both dashboard and admin
                "updated_at": datetime.utcnow()
            }}
        )
        user_id = str(existing["_id"])
        print(f"✅ Updated {email} to premium/admin user.")
    else:
        result = await users_col.insert_one({
            "name": name,
            "email": email,
            "hashed_password": hashed,
            "is_active": True,
            "user_type": "paid",
            "is_admin": True,
            "subscription": "premium",
            "subscription_expiry": datetime(2027, 12, 31),
            "created_at": datetime.utcnow()
        })
        user_id = str(result.inserted_id)
        print(f"✅ Created new user {email} as premium/admin.")

    # Ensure fake transaction exists
    existing_tx = await transactions_col.find_one({"user_email": email, "status": "success"})
    if not existing_tx:
        await transactions_col.insert_one({
            "tran_id": "DEMO_TXN_SAKIB_001",
            "user_id": user_id,
            "user_name": name,
            "user_email": email,
            "amount": 299,
            "currency": "BDT",
            "plan": "premium_monthly",
            "payment_method": "bKash",
            "status": "success",
            "val_id": "DEMO_VAL_SAKIB_001",
            "card_brand": "Mobile Banking",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print(f"✅ Inserted transaction for {email}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(run())
