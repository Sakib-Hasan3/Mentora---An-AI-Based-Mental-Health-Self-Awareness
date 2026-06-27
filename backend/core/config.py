from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Resolve .env path relative to this file's parent directory
_env_path = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    # ─── App ───────────────────────────────────────────────────────────────
    APP_NAME: str = "Mentora Mental Health API"
    VERSION: str = "2.0.0"
    ENV: str = "development"   # "development" | "production" | "staging"
    PORT: int = 8000

    # ─── Security ──────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60          # 1 hour (was 43200 = 30 days!)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── Database ──────────────────────────────────────────────────────────
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "mentora_db"

    # ─── AI / LLM API Keys ─────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    HF_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # ─── Payment ───────────────────────────────────────────────────────────
    SSLCOMMERZ_STORE_ID: str = ""
    SSLCOMMERZ_STORE_PASSWD: str = ""
    SSLCOMMERZ_IS_SANDBOX: bool = True
    PAYMENT_MOCK_MODE: bool = False   # True only in dev to bypass SSLCommerz

    # ─── SMTP / Email (REQUIRED for Verification/Reset) ───────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@mentora.com"
    SMTP_FROM_NAME: str = "Mentora Support"

    # ─── URLs ──────────────────────────────────────────────────────────────
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    # Comma-separated list of extra allowed CORS origins (optional)
    CORS_ORIGINS: str = ""

    # ─── Derived / Computed ────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.ENV.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENV.lower() == "development"

    @property
    def debug(self) -> bool:
        return not self.is_production

    @property
    def docs_url(self) -> Optional[str]:
        """Disable Swagger UI in production."""
        return None if self.is_production else "/docs"

    @property
    def redoc_url(self) -> Optional[str]:
        """Disable ReDoc in production."""
        return None if self.is_production else "/redoc"

    @property
    def allowed_origins(self) -> list[str]:
        """Build CORS allow-list from FRONTEND_URL, CORS_ORIGINS, and dev defaults."""
        origins: set[str] = set()

        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL.rstrip("/"))

        if self.CORS_ORIGINS:
            for origin in self.CORS_ORIGINS.split(","):
                cleaned = origin.strip().rstrip("/")
                if cleaned:
                    origins.add(cleaned)

        if self.is_production:
            return sorted(origins) if origins else [self.FRONTEND_URL]

        origins.update(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
            ]
        )
        return sorted(origins)

    # ─── Validators ────────────────────────────────────────────────────────
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if v in ("CHANGE_ME", "mysecretkey123", "change-me-in-production", ""):
            import logging as _log
            _log.warning(
                "⚠️  WARNING: SECRET_KEY is using an insecure default value! "
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        return v

    @model_validator(mode="after")
    def warn_production_issues(self) -> "Settings":
        if self.is_production:
            issues = []
            if self.SECRET_KEY in ("CHANGE_ME", "mysecretkey123", "change-me-in-production", ""):
                issues.append("SECRET_KEY is not set to a secure value")
            if self.SSLCOMMERZ_IS_SANDBOX:
                issues.append("SSLCOMMERZ_IS_SANDBOX is True (payments won't work in production)")
            if self.PAYMENT_MOCK_MODE:
                issues.append("PAYMENT_MOCK_MODE is True in production — disable this!")
            if not self.GROQ_API_KEY:
                issues.append("GROQ_API_KEY is not set")

            if issues:
                logger.warning("🚨 Production configuration issues detected:")
                for issue in issues:
                    logger.warning(f"   ❌ {issue}")

        return self

    class Config:
        env_file = str(_env_path)
        env_file_encoding = "utf-8"
        extra = "allow"


# ─── Singleton ─────────────────────────────────────────────────────────────
settings = Settings()

# ─── Startup log (concise, not printing secret values) ─────────────────────
logger.info(f"⚙️  ENV={settings.ENV} | PORT={settings.PORT} | DB={settings.DATABASE_NAME}")
logger.info(f"🔑 GROQ={'✅' if settings.GROQ_API_KEY else '❌'} | "
            f"HF={'✅' if settings.HF_API_KEY else '❌'} | "
            f"GEMINI={'✅' if settings.GEMINI_API_KEY else '❌'}")
