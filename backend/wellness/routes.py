from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, date
from core.database import db
from auth.dependencies.auth import get_current_user
from bson import ObjectId
import random

wellness_router = APIRouter(prefix="/wellness", tags=["Wellness"])

AFFIRMATIONS_BN = [
    "আজকের দিনটি আপনার জন্য একটি নতুন সুযোগ। আপনি পারবেন! 💪",
    "আপনার মানসিক শান্তি সবচেয়ে গুরুত্বপূর্ণ সম্পদ। নিজের যত্ন নিন। 🌸",
    "প্রতিটি ছোট পদক্ষেপই বড় সাফল্যের দিকে এগিয়ে নিয়ে যায়। 🚶",
    "আপনি যতটা ভাবছেন তার চেয়ে অনেক বেশি শক্তিশালী। 🌟",
    "কঠিন সময়গুলো আপনাকে আরও মজবুত করে তোলে। 🏔️",
    "শ্বাস নিন। এই মুহূর্তে সবকিছু ঠিক আছে। 🍃",
    "আপনার অনুভূতি বৈধ। নিজেকে সময় দিন। ❤️",
    "আজ একটু বেশি হাসুন — এটাই সেরা ওষুধ। 😊",
    "ব্যর্থতা নয়, অভিজ্ঞতা — এটাই আপনাকে এগিয়ে নিয়ে যাবে। 🌈",
    "আপনি একা নন। অনেকেই আপনার পাশে আছেন। 🤝",
    "নিজেকে ভালোবাসুন, কারণ আপনি তার যোগ্য। 💖",
    "মাথা উঁচু রাখুন — ঝড়ের পরেই রোদ আসে। ☀️",
    "আপনার স্বপ্ন সত্যি হওয়ার সম্ভাবনা আছে। বিশ্বাস রাখুন। 🌠",
    "ছোট ছোট আনন্দেই জীবন সুন্দর। 🌺",
    "আজকের প্রতিটি মুহূর্তকে উপভোগ করুন। 🎵",
    "আপনার গতিতে চলুন — তুলনা নয়, অগ্রগতিই লক্ষ্য। 🎯",
    "নিজের প্রতি সদয় হন, যেমন প্রিয়জনের প্রতি হন। 🌻",
    "একটু বিশ্রাম নেওয়া দুর্বলতা নয়, বুদ্ধিমানের কাজ। 😴",
    "আপনার উপস্থিতিতে পৃথিবী সুন্দর হয়। 🌍",
    "আশা কখনো হারাবেন না — সামনে ভালো দিন আসছে। 🌅",
]

WELLNESS_TIPS = [
    { "title": "গভীর শ্বাস নিন", "body": "প্রতিদিন ৫ মিনিট গভীর শ্বাসের ব্যায়াম করুন। এটি মানসিক চাপ কমায়।", "icon": "🫁" },
    { "title": "পানি পান করুন", "body": "সারাদিনে পর্যাপ্ত পানি পান করুন। শরীর হাইড্রেটেড থাকলে মেজাজ ভালো থাকে।", "icon": "💧" },
    { "title": "হাঁটুন", "body": "দিনে ৩০ মিনিট হাঁটলে মানসিক স্বাস্থ্য উল্লেখযোগ্যভাবে উন্নত হয়।", "icon": "🚶" },
    { "title": "কৃতজ্ঞতা প্রকাশ করুন", "body": "প্রতিদিন ৩টি বিষয়ের জন্য কৃতজ্ঞ থাকুন — এটি ইতিবাচক মনোভাব তৈরি করে।", "icon": "🙏" },
    { "title": "সামাজিক যোগাযোগ", "body": "প্রিয়জনের সাথে কথা বলুন। সামাজিক সংযোগ মানসিক সুস্থতার চাবিকাঠি।", "icon": "💬" },
    { "title": "ঘুম নিশ্চিত করুন", "body": "প্রতিরাতে ৭-৮ ঘণ্টা ঘুমানোর চেষ্টা করুন। ঘুম মানসিক শক্তি পুনরুদ্ধার করে।", "icon": "🌙" },
]

class MoodRequest(BaseModel):
    mood: int  # 1-5
    emoji: str
    note: Optional[str] = None

class GratitudeRequest(BaseModel):
    note: str

def get_today_str():
    return date.today().isoformat()

def get_affirmation_of_day():
    day_of_year = datetime.utcnow().timetuple().tm_yday
    return AFFIRMATIONS_BN[day_of_year % len(AFFIRMATIONS_BN)]

def get_tips_of_day():
    day_of_year = datetime.utcnow().timetuple().tm_yday
    start = day_of_year % len(WELLNESS_TIPS)
    tips = []
    for i in range(3):
        tips.append(WELLNESS_TIPS[(start + i) % len(WELLNESS_TIPS)])
    return tips

@wellness_router.post("/mood")
async def save_mood(data: MoodRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    today = get_today_str()

    col = db.get_collection("wellness_moods")
    await col.update_one(
        {"user_id": user_id, "date": today},
        {"$set": {
            "user_id": user_id,
            "mood": data.mood,
            "emoji": data.emoji,
            "note": data.note,
            "date": today,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"success": True, "message": "মেজাজ সংরক্ষিত হয়েছে!"}

@wellness_router.get("/mood")
async def get_mood(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    today = get_today_str()
    col = db.get_collection("wellness_moods")

    today_mood = await col.find_one({"user_id": user_id, "date": today})
    # Last 7 days
    week_ago = (datetime.utcnow() - timedelta(days=7)).date().isoformat()
    cursor = col.find({"user_id": user_id, "date": {"$gte": week_ago}}).sort("date", -1)
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)

    return {
        "today": {
            "mood": today_mood.get("mood") if today_mood else None,
            "emoji": today_mood.get("emoji") if today_mood else None,
            "note": today_mood.get("note") if today_mood else None,
        } if today_mood else None,
        "history": history
    }

@wellness_router.get("/streak")
async def get_streak(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    col = db.get_collection("wellness_moods")
    cursor = col.find({"user_id": user_id}).sort("date", -1).limit(60)
    dates = set()
    async for doc in cursor:
        dates.add(doc["date"])

    streak = 0
    check_date = date.today()
    while check_date.isoformat() in dates:
        streak += 1
        check_date = check_date - timedelta(days=1)

    return {"streak": streak, "message": f"🔥 {streak} দিনের ধারাবাহিকতা!"}

@wellness_router.get("/affirmation")
async def get_affirmation():
    return {
        "affirmation": get_affirmation_of_day(),
        "tips": get_tips_of_day()
    }

@wellness_router.post("/gratitude")
async def save_gratitude(data: GratitudeRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    today = get_today_str()
    col = db.get_collection("wellness_gratitude")
    await col.update_one(
        {"user_id": user_id, "date": today},
        {"$set": {
            "user_id": user_id,
            "note": data.note,
            "date": today,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"success": True, "message": "কৃতজ্ঞতা সংরক্ষিত হয়েছে! 🙏"}

@wellness_router.get("/gratitude")
async def get_gratitude(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    today = get_today_str()
    col = db.get_collection("wellness_gratitude")
    doc = await col.find_one({"user_id": user_id, "date": today})
    return {"note": doc.get("note") if doc else None, "date": today}
