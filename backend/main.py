from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import db
from core.config import settings
from auth import auth_router
from dashboard import dashboard_router
from assessment import assessment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    print(f"🚀 Server running on http://localhost:{settings.PORT}")
    print(f"📚 API Docs: http://localhost:{settings.PORT}/docs")
    yield
    await db.disconnect()


app = FastAPI(
    title="Mental Health API",
    description="Mental Health Assessment & Dashboard API",
    version="2.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.98.226:3000",
        "http://localhost:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(assessment_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Mental Health API is running",
        "version": "2.0.0",
        "status": "active",
        "endpoints": {
            "auth": {
                "signup": "POST /api/auth/signup",
                "login": "POST /api/auth/login"
            },
            "dashboard": {
                "stats": "GET /api/dashboard/stats",
                "chart_data": "GET /api/dashboard/chart-data",
                "recent_activity": "GET /api/dashboard/recent-activity"
            },
            "assessment": {
                "questions": "GET /api/assessment/questions",
                "submit": "POST /api/assessment/submit",
                "all": "GET /api/assessment/all"
            }
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected" if db.client else "disconnected",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat()
    }