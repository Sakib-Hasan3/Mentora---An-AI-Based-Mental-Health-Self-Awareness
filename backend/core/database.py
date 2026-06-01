from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
class MongoDB:
    client = None
    database = None
    @classmethod
    async def connect(cls):
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        cls.database = cls.client[settings.DATABASE_NAME]
        print(f"✅ MongoDB connected: {settings.DATABASE_NAME}")
    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
            print("✅ MongoDB disconnected")
    @classmethod
    def get_collection(cls, name):
        return cls.database[name]
db = MongoDB()
