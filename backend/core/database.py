import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from core.config import settings

logger = logging.getLogger(__name__)


class MongoDB:
    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | None = None

    # ─── Connection ────────────────────────────────────────────────────────
    @classmethod
    async def connect(cls, max_retries: int = 5, retry_delay: float = 2.0) -> None:
        """
        Connect to MongoDB with retry logic and connection pooling.
        Raises RuntimeError if all retries are exhausted.
        """
        for attempt in range(1, max_retries + 1):
            try:
                cls.client = AsyncIOMotorClient(
                    settings.MONGODB_URL,
                    # Connection pool settings
                    maxPoolSize=50,
                    minPoolSize=5,
                    maxIdleTimeMS=30_000,
                    # Timeouts
                    serverSelectionTimeoutMS=5_000,
                    connectTimeoutMS=5_000,
                    socketTimeoutMS=10_000,
                    # Retry writes on transient errors
                    retryWrites=True,
                )
                # Verify the connection is alive
                await cls.client.admin.command("ping")
                cls.database = cls.client[settings.DATABASE_NAME]
                logger.info(
                    "✅ MongoDB connected | db=%s | pool_max=%d",
                    settings.DATABASE_NAME, 50,
                )
                await cls._create_indexes()
                return
            except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
                if attempt == max_retries:
                    logger.error("❌ MongoDB connection failed after %d attempts: %s", max_retries, exc)
                    raise RuntimeError(
                        f"Cannot connect to MongoDB at {settings.MONGODB_URL}"
                    ) from exc
                wait = retry_delay * attempt
                logger.warning(
                    "⚠️  MongoDB connect attempt %d/%d failed — retrying in %.1fs",
                    attempt, max_retries, wait,
                )
                await asyncio.sleep(wait)

    @classmethod
    async def disconnect(cls) -> None:
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.database = None
            logger.info("✅ MongoDB disconnected")

    # ─── Collection accessor ───────────────────────────────────────────────
    @classmethod
    def get_collection(cls, name: str):
        if cls.database is None:
            raise RuntimeError("Database not connected. Call MongoDB.connect() first.")
        return cls.database[name]

    # ─── Index management ──────────────────────────────────────────────────
    @classmethod
    async def _create_indexes(cls) -> None:
        """
        Create all necessary MongoDB indexes at startup.
        Using create_indexes is idempotent — safe to call on every startup.
        """
        db = cls.database
        try:
            # users
            await db["users"].create_indexes([
                IndexModel([("email", ASCENDING)], unique=True, name="email_unique"),
                IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
                IndexModel([("is_active", ASCENDING)], name="is_active"),
            ])

            # assessments
            await db["assessments"].create_indexes([
                IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
                IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
            ])

            # notifications
            await db["notifications"].create_indexes([
                IndexModel([("user_id", ASCENDING), ("is_read", ASCENDING)], name="user_unread"),
                IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
                IndexModel([("created_at", ASCENDING)], expireAfterSeconds=30 * 24 * 3600,
                           name="ttl_30days"),   # auto-delete old notifications
            ])

            # bookings
            await db["bookings"].create_indexes([
                IndexModel([("user_id", ASCENDING), ("date", ASCENDING)], name="user_date"),
                IndexModel([("consultant_id", ASCENDING), ("date", ASCENDING)], name="consultant_date"),
                IndexModel([("status", ASCENDING)], name="status"),
                IndexModel([("date", ASCENDING), ("status", ASCENDING), ("reminder_sent", ASCENDING)],
                           name="reminder_lookup"),
            ])

            # community posts
            await db["posts"].create_indexes([
                IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
                IndexModel([("author_id", ASCENDING)], name="author"),
            ])

            # payments
            await db["payments"].create_indexes([
                IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
                IndexModel([("tran_id", ASCENDING)], unique=True, sparse=True, name="tran_id_unique"),
            ])

            logger.info("📑 MongoDB indexes ensured")
        except Exception as exc:
            # Index creation failure is non-fatal; log and continue
            logger.warning("⚠️  Index creation warning: %s", exc)


# ─── Singleton ─────────────────────────────────────────────────────────────
db = MongoDB()
