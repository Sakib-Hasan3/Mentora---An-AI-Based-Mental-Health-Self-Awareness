from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(assessment_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(chatbot_router, prefix="/api")
app.include_router(books_router, prefix="/api")
app.include_router(community_router, prefix="/api")
app.include_router(consultant_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")


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
            },
            "progress": {
                "overview": "GET /api/progress/overview",
                "weekly": "GET /api/progress/weekly",
                "monthly": "GET /api/progress/monthly",
                "yearly": "GET /api/progress/yearly",
                "milestones": "GET /api/progress/milestones"
            },
            "books": {
                "books": "GET /api/books/books"
            },
            "community": {
                "posts": "GET /api/community/posts",
                "create": "POST /api/community/posts"
            },
            "consultants": {
                "list": "GET /api/consultants/",
                "book": "POST /api/consultants/{id}/book",
                "my_bookings": "GET /api/consultants/my-bookings"
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
