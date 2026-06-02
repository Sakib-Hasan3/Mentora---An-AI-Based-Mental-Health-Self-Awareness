from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from auth.dependencies.auth import get_current_user
from core.database import db
from bson import ObjectId
import random

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("/overview")
async def get_progress_overview(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", 1).to_list(length=100)
    
    if not assessments:
        return {
            "total_assessments": 0,
            "average_score": 0,
            "best_score": 0,
            "worst_score": 0,
            "improvement": 0,
            "trend": "stable",
            "current_streak": 0,
            "best_streak": 0,
            "last_assessment_date": None,
            "recommendation": "আপনার প্রথম অ্যাসেসমেন্ট দিন শুরু করতে"
        }
    
    scores = [a.get("score", 0) for a in assessments]
    avg_score = sum(scores) // len(scores)
    best_score = max(scores)
    worst_score = min(scores)
    improvement = scores[-1] - scores[0] if len(scores) >= 2 else 0
    
    if improvement > 5:
        trend = "improving"
    elif improvement < -5:
        trend = "declining"
    else:
        trend = "stable"
    
    streak = calculate_streak(assessments)
    
    recommendation = get_recommendation(avg_score, trend, improvement)
    
    return {
        "total_assessments": len(assessments),
        "average_score": avg_score,
        "best_score": best_score,
        "worst_score": worst_score,
        "improvement": improvement,
        "trend": trend,
        "current_streak": streak["current"],
        "best_streak": streak["best"],
        "last_assessment_date": assessments[0].get("created_at") if assessments else None,
        "recommendation": recommendation
    }

@router.get("/weekly")
async def get_weekly_progress(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", 1).to_list(length=30)
    
    labels = []
    data = []
    
    if assessments and len(assessments) > 0:
        for a in assessments[-7:]:
            labels.append(a.get("created_at", datetime.utcnow()).strftime("%a, %d %b"))
            data.append(a.get("score", 0))
    else:
        days = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি', 'রবি']
        for i, day in enumerate(days):
            labels.append(day)
            data.append(random.randint(60, 80))
    
    return {
        "labels": labels,
        "data": data,
        "type": "weekly"
    }

@router.get("/monthly")
async def get_monthly_progress(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", 1).to_list(length=100)
    
    monthly_data = {}
    
    if assessments and len(assessments) > 0:
        for a in assessments:
            month_key = a.get("created_at", datetime.utcnow()).strftime("%b %Y")
            score = a.get("score", 0)
            if month_key not in monthly_data:
                monthly_data[month_key] = []
            monthly_data[month_key].append(score)
        
        labels = list(monthly_data.keys())[-6:]
        data = [sum(monthly_data[lab]) // len(monthly_data[lab]) for lab in labels]
    else:
        months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন']
        labels = months
        data = [random.randint(65, 85) for _ in range(6)]
    
    return {
        "labels": labels,
        "data": data,
        "type": "monthly"
    }

@router.get("/yearly")
async def get_yearly_progress(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", 1).to_list(length=100)
    
    if assessments and len(assessments) > 0:
        avg_score = sum(a.get("score", 0) for a in assessments) // len(assessments)
        first_score = assessments[0].get("score", 0) if assessments else 0
        last_score = assessments[-1].get("score", 0) if assessments else 0
        improvement = last_score - first_score
    else:
        avg_score = 70
        improvement = 0
    
    return {
        "labels": ["১ম মাস", "২য় মাস", "৩য় মাস", "৪র্থ মাস", "৫ম মাস", "৬ষ্ঠ মাস"],
        "data": [avg_score - 10, avg_score - 5, avg_score, avg_score + 3, avg_score + 7, avg_score + 12],
        "type": "yearly",
        "improvement": improvement
    }

@router.get("/milestones")
async def get_milestones(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection("assessments").find(
        {"user_id": user_id}
    ).sort("created_at", 1).to_list(length=100)
    
    milestones = []
    
    if assessments and len(assessments) > 0:
        scores = [a.get("score", 0) for a in assessments]
        
        if len(scores) >= 5:
            milestones.append({
                "id": 1,
                "title": "৫টি অ্যাসেসমেন্ট সম্পন্ন",
                "date": assessments[4].get("created_at").strftime("%d %b, %Y"),
                "achieved": True,
                "icon": "🏆"
            })
        
        if max(scores) >= 90:
            milestones.append({
                "id": 2,
                "title": "৯০% স্কোর অর্জন",
                "date": next((a.get("created_at") for a in assessments if a.get("score", 0) >= 90), None),
                "achieved": True,
                "icon": "⭐"
            })
        
        if scores[-1] > scores[0] + 10:
            milestones.append({
                "id": 3,
                "title": "১০% উন্নতি",
                "date": assessments[-1].get("created_at").strftime("%d %b, %Y"),
                "achieved": True,
                "icon": "📈"
            })
    
    milestones.append({
        "id": 4,
        "title": "নিয়মিত সাপ্তাহিক পরীক্ষা",
        "date": "লক্ষ্য",
        "achieved": len(assessments) >= 4,
        "icon": "📅"
    })
    
    milestones.append({
        "id": 5,
        "title": "মেডিটেশন মাস্টার",
        "date": "লক্ষ্য",
        "achieved": False,
        "icon": "🧘"
    })
    
    return {"milestones": milestones}

def calculate_streak(assessments):
    if not assessments:
        return {"current": 0, "best": 0}
    
    dates = [a.get("created_at").date() for a in assessments if a.get("created_at")]
    dates = sorted(set(dates), reverse=True)
    
    current_streak = 1
    best_streak = 1
    
    for i in range(len(dates) - 1):
        diff = (dates[i] - dates[i+1]).days
        if diff <= 1:
            current_streak += 1
            best_streak = max(best_streak, current_streak)
        else:
            break
    
    return {"current": current_streak, "best": best_streak}

def get_recommendation(avg_score, trend, improvement):
    if avg_score >= 80:
        return "আপনি ভালো আছেন! নিয়মিত ব্যায়াম ও মেডিটেশন চালিয়ে যান।"
    elif avg_score >= 60:
        return "আপনার মানসিক স্বাস্থ্য মাঝারি। নিয়মিত মেডিটেশন ও পর্যাপ্ত ঘুমের চেষ্টা করুন।"
    elif avg_score >= 40:
        return "আপনার মানসিক স্বাস্থ্যের যত্ন নেওয়া জরুরি। দয়া করে কারো সাথে কথা বলুন বা বিশেষজ্ঞের পরামর্শ নিন।"
    else:
        return "আপনি কঠিন সময় পার করছেন। দয়া করে একজন মানসিক স্বাস্থ্য বিশেষজ্ঞের সাথে যোগাযোগ করুন। ২৪/৭ হেল্পলাইন: ১৬২৬৩"
