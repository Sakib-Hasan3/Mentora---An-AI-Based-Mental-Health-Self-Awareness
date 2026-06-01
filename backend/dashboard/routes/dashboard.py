from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
import random
from auth.dependencies.auth import get_current_user
from core.database import db
from bson import ObjectId

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find({"user_id": user_id}).to_list(length=100)
    
    total_assessments = len(assessments)
    
    if total_assessments > 0:
        avg_score = sum(a.get("score", 0) for a in assessments) // total_assessments
        latest_score = assessments[0].get("score", 0) if assessments else 0
    else:
        avg_score = 0
        latest_score = 0
    
    return {
        "mental_health_score": latest_score if latest_score > 0 else 75,
        "average_score": avg_score,
        "total_assessments": total_assessments,
        "stress_level": random.randint(20, 60),
        "meditation_sessions": random.randint(0, 15),
        "member_since": current_user.get("created_at", datetime.utcnow()).strftime("%B %Y") if current_user.get("created_at") else "June 2024",
        "improvement": "+8%" if total_assessments > 0 else "0%"
    }

@router.get("/assessments")
async def get_user_assessments(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(length=20)
    
    result = []
    for a in assessments:
        result.append({
            "id": str(a["_id"]),
            "score": a.get("score", 0),
            "level": a.get("level", "Normal"),
            "date": a.get("created_at", datetime.utcnow()).strftime("%b %d, %Y"),
            "advice": a.get("advice", "Keep going!")
        })
    
    return {"assessments": result, "total": len(result)}

@router.get("/chart-data")
async def get_chart_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", 1).to_list(length=30)
    
    labels = []
    data = []
    
    if assessments:
        for a in assessments[-7:]:
            labels.append(a.get("created_at", datetime.utcnow()).strftime("%b %d"))
            data.append(a.get("score", 0))
    else:
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for day in days:
            labels.append(day)
            data.append(random.randint(65, 85))
    
    return {
        "labels": labels,
        "data": data,
        "total_assessments": len(assessments)
    }

@router.get("/recent-activity")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(length=5)
    
    activities = []
    
    for a in assessments:
        activities.append({
            "type": "assessment",
            "title": "Mental Health Assessment",
            "description": f"You scored {a.get('score', 0)}% - {a.get('level', 'Normal')}",
            "date": a.get("created_at", datetime.utcnow()).strftime("%I:%M %p, %b %d"),
            "icon": "📝",
            "color": "#10b981"
        })
    
    if not activities:
        activities.append({
            "type": "welcome",
            "title": "Welcome to Mentora!",
            "description": "Take your first mental health assessment to get started",
            "date": datetime.utcnow().strftime("%I:%M %p"),
            "icon": "🎉",
            "color": "#8b5cf6"
        })
    
    return {"activities": activities}
