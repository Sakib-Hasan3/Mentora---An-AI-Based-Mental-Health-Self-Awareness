import asyncio
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Add parent directory to path to allow importing core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.security import hash_password

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", os.getenv("DB_NAME", "mental_health_db"))

async def create_admin(email, password, name):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    users_col = db["users"]

    email = email.lower().strip()
    hashed = hash_password(password)

    existing = await users_col.find_one({"email": email})
    if existing:
        await users_col.update_one(
            {"email": email},
            {"$set": {
                "is_admin": True,
                "user_type": "admin",
                "hashed_password": hashed,
                "is_active": True,
                "updated_at": datetime.utcnow()
            }}
        )
        print(f"✅ Existing user promoted to admin: {email}")
    else:
        await users_col.insert_one({
            "name": name,
            "email": email,
            "hashed_password": hashed,
            "is_active": True,
            "user_type": "admin",
            "is_admin": True,
            "created_at": datetime.utcnow()
        })
        print(f"✅ Created new admin user: {email}")

    client.close()

if __name__ == "__main__":
    email = input("Admin Email: ").strip()
    password = input("Admin Password: ").strip()
    name = input("Admin Name (Default: Admin): ").strip() or "Admin"

    if not email or not password:
        print("❌ Email and password are required!")
        sys.exit(1)

    asyncio.run(create_admin(email, password, name))
