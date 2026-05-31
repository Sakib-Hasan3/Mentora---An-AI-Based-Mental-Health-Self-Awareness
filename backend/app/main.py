import os
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
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


class SignupIn(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str


@app.post('/api/signup', status_code=201)
def signup(payload: SignupIn):
    # NOTE: This is a simple mock endpoint for local development.
    # In production you should hash passwords, validate uniqueness,
    # and persist the user to the database.
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail='ইমেইল এবং পাসওয়ার্ড প্রয়োজন')

    return {"message": "user created", "email": payload.email}
