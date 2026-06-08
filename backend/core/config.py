from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Mental Health API"
    DEBUG: bool = True
    PORT: int = 8000
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "mental_health_db"
    SECRET_KEY: str = "my_super_secret_key_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days (was 30 minutes)
    
    class Config:
        env_file = ".env"

settings = Settings()