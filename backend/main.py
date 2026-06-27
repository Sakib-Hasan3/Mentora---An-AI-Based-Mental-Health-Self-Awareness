import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from core.logging_config import setup_logging

# Setup logging BEFORE importing other modules that use logger
setup_logging()


logger = logging.getLogger(__name__)

from core.database import db
from core.config import settings
from auth import auth_router
from dashboard import dashboard_router
from assessment import assessment_router
from progress import progress_router
from chatbot import chatbot_router
from books import books_router
from community import community_router
from consultant import consultant_router
from notifications import notifications_router
from ml_assessment import ml_assessment_router
from ml_model import ml_assessment_router as ml_model_router
from rag_system import rag_router
from cms import cms_router
from payment import payment_router
from wellness import wellness_router
from scheduler import create_scheduler



# ─── Lifespan ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──
    logger.info("🚀 Starting Mentora API | ENV=%s | PORT=%d", settings.ENV, settings.PORT)
    await db.connect()

    _scheduler = create_scheduler()
    _scheduler.start()
    logger.info(
        "🔔 APScheduler started | jobs=%d | docs=%s | origins=%s",
        len(_scheduler.get_jobs()),
        settings.docs_url,
        settings.allowed_origins,
    )

    yield

    # ── Shutdown ──
    _scheduler.shutdown(wait=False)
    await db.disconnect()
    logger.info("🛑 Server shut down cleanly")


# ─── Request Logging Middleware ────────────────────────────────────────────
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        import time
        import uuid

        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s → %d [%.1fms] id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )
        response.headers["X-Request-ID"] = request_id
        return response


# ─── App Factory ───────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Based Mental Health Self-Awareness Platform",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    openapi_url="/openapi.json" if not settings.is_production else None,
)


# ─── Middleware ────────────────────────────────────────────────────────────
app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)


# ─── Global Error Handlers ─────────────────────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning("HTTP %d: %s %s", exc.status_code, request.method, request.url.path)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error on %s %s: %s", request.method, request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation failed",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method, request.url.path, exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error. Please try again later."},
    )


# ─── Routers ──────────────────────────────────────────────────────────────
_API = "/api"
app.include_router(auth_router, prefix=_API)
app.include_router(dashboard_router, prefix=_API)
app.include_router(assessment_router, prefix=_API)
app.include_router(progress_router, prefix=_API)
app.include_router(chatbot_router, prefix=_API)
app.include_router(books_router, prefix=_API)
app.include_router(community_router, prefix=_API)
app.include_router(consultant_router, prefix=_API)
app.include_router(notifications_router, prefix=_API)
app.include_router(ml_assessment_router, prefix=_API)
app.include_router(rag_router, prefix=_API)
app.include_router(cms_router, prefix=_API)
app.include_router(payment_router, prefix=_API)
app.include_router(wellness_router, prefix=_API)


# ─── Core Endpoints ───────────────────────────────────────────────────────
@app.get("/", tags=["Root"], include_in_schema=not settings.is_production)
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "env": settings.ENV,
        "docs": settings.docs_url,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for load balancers and Docker healthchecks.
    Returns 200 if the service is healthy, 503 otherwise.
    """
    db_status = "connected" if db.client is not None else "disconnected"
    healthy = db.client is not None

    return JSONResponse(
        status_code=status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "healthy" if healthy else "unhealthy",
            "database": db_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": settings.VERSION,
        },
    )
