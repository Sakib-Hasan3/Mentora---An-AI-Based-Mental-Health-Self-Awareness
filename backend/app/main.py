import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .db import get_db

app = FastAPI(title="Mentora API")

# ✅ CORS (Frontend থেকে API call allow করার জন্য)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# ✅ DEV-only DB check (Production-এ expose না করার জন্য)
@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    if os.getenv("ENV", "dev") != "dev":
        return {"detail": "Not available in production"}
    val = db.execute(text("SELECT 1")).scalar()
    return {"db": "ok", "select_1": val}
