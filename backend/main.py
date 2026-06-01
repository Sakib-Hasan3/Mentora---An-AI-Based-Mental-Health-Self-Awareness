from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import db
from core.config import settings
from auth import auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    print(f"Server running on http://localhost:{settings.PORT}")
    yield
    await db.disconnect()

app = FastAPI(title="Mental Health API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.98.226:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Mental Health API is running"}
