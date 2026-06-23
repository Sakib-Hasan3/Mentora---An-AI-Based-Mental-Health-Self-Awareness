from pydantic_settings import BaseSettings
import os
from pathlib import Path

# .env ফাইলের পাথ নির্ধারণ
env_path = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    APP_NAME: str = "Mental Health API"
    DEBUG: bool = True
    PORT: int = 8000
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "mental_health_db"
    SECRET_KEY: str = "mysecretkey123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    
    # API Keys
    GROQ_API_KEY: str = ""
    HF_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"

# Settings instance
settings = Settings()

# Print API Key status (for debugging)
print(f"🔑 GROQ_API_KEY: {'✅ Found' if settings.GROQ_API_KEY else '❌ Not found'}")
print(f"🔑 HF_API_KEY: {'✅ Found' if settings.HF_API_KEY else '❌ Not found'}")
