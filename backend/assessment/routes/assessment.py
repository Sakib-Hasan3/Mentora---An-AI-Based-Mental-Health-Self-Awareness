
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from auth.dependencies.auth import get_current_user
from core.database import db
from assessment.models.assessment import AssessmentModel, AssessmentStatsModel
from assessment.schemas.assessment import AssessmentSubmit, AssessmentResponse, AssessmentListResponse
from notifications.services.notification_service import notification_service

router = APIRouter(prefix="/assessment", tags=["Assessment"])

ASSESSMENT_COLLECTION = "assessments"

QUESTIONS = [
    {"id": 1, "text": "গত ৭ দিনে আপনি কতবার মন খারাপ অনুভব করেছেন?", "options": ["কখনো না", "১-২ বার", "৩-৪ বার", "প্রতিদিন"]},
    {"id": 2, "text": "আপনার ঘুম কেমন হয়েছে?", "options": ["ভালো", "মাঝারি", "খারাপ", "একদমই না"]},
    {"id": 3, "text": "কাজ/পড়ার প্রতি আগ্রহ কেমন?", "options": ["স্বাভাবিক", "কমেছে", "অনেক কমেছে", "একদম নেই"]},
    {"id": 4, "text": "সামাজিক যোগাযোগ কেমন ছিল?", "options": ["স্বাভাবিক", "কমেছে", "প্রায় নেই", "একদমই না"]},
    {"id": 5, "text": "আপনার চাপের মাত্রা কেমন?", "options": ["কম", "মাঝারি", "বেশি", "অতি বেশি"]},
    {"id": 6, "text": "আপনি কি উদ্বিগ্ন বোধ করছেন?", "options": ["একদম না", "কখনো কখনো", "প্রায়ই", "সবসময়"]},
    {"id": 7, "text": "আপনার শক্তি ও উদ্যম কেমন?", "options": ["স্বাভাবিক", "কম", "খুব কম", "একদম নেই"]},
    {"id": 8, "text": "আপনি কি একা অনুভব করছেন?", "options": ["না", "কখনো কখনো", "প্রায়ই", "সবসময়"]},
    {"id": 9, "text": "আপনার মনোযোগ ধরে রাখতে পারেন?", "options": ["স্বাভাবিক", "কখনো কখনো", "প্রায়ই পারি না", "একদম পারি না"]},
    {"id": 10, "text": "আপনার জীবন নিয়ে কেমন অনুভব করেন?", "options": ["সন্তুষ্ট", "মাঝারি", "অসন্তুষ্ট", "হতাশ"]}
]

@router.get("/questions")
async def get_questions():
    return {"success": True, "questions": QUESTIONS}

@router.post("/submit", response_model=AssessmentResponse)
async def submit_assessment(
    assessment_data: AssessmentSubmit,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    answers = assessment_data.answers
    
    total_score = 0
    for answer in answers:
        answer_text = answer.get("answer", "")
        if answer_text == "ভালো" or answer_text == "কখনো না" or answer_text == "না" or answer_text == "একদম না" or answer_text == "সন্তুষ্ট" or answer_text == "স্বাভাবিক":
            total_score += 20
        elif answer_text == "মাঝারি" or answer_text == "কখনো কখনো" or answer_text == "১-২ বার":
            total_score += 15
        elif answer_text == "বেশি" or answer_text == "অসন্তুষ্ট" or answer_text == "প্রায়ই" or answer_text == "৩-৪ বার":
            total_score += 10
        else:
            total_score += 5
    
    max_possible = len(QUESTIONS) * 20
    final_score = int((total_score / max_possible) * 100) if max_possible > 0 else 50
    
    if final_score >= 80:
        level = "স্বাভাবিক"
        advice = "আপনি ভালো আছেন! সুস্থ থাকার জন্য নিয়মিত ব্যায়াম ও মেডিটেশন করুন।"
    elif final_score >= 60:
        level = "হালকা"
        advice = "আপনি মাঝারি ঝুঁকিতে আছেন। নিয়মিত মেডিটেশন ও ব্যায়াম আপনার জন্য উপকারী হবে।"
    elif final_score >= 40:
        level = "মাঝারি"
        advice = "আমরা বুঝি আপনি কঠিন সময় পার করছেন। দয়া করে কারো সাথে কথা বলুন। আমাদের ২৪/৭ হেল্পলাইন: ১৬২৬৩"
    else:
        level = "গুরুতর"
        advice = "আপনার মানসিক স্বাস্থ্যের জন্য দয়া করে একজন বিশেষজ্ঞের সাথে কথা বলুন। আমরা আছি আপনার পাশে।"
    
    assessment_doc = AssessmentModel.create(
        user_id=user_id,
        answers=answers,
        score=final_score,
        level=level,
        advice=advice
    )
    
    result = await db.get_collection(ASSESSMENT_COLLECTION).insert_one(assessment_doc)
    
    await update_user_stats(user_id, final_score)
    
    # 🔔 নোটিফিকেশন পাঠান
    await notification_service.notify_assessment_completed(
        user_id=user_id,
        score=final_score,
        level=level
    )
    
    return {
        "success": True,
        "message": "অ্যাসেসমেন্ট সফলভাবে সম্পন্ন হয়েছে!",
        "assessment_id": str(result.inserted_id),
        "score": final_score,
        "level": level,
        "advice": advice
    }

@router.get("/all", response_model=AssessmentListResponse)
async def get_all_assessments(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    assessments = await db.get_collection(ASSESSMENT_COLLECTION).find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(length=100)
    
    assessment_results = []
    for a in assessments:
        assessment_results.append(AssessmentModel.from_db(a))
    
    stats = AssessmentStatsModel.calculate_stats(assessments)
    
    return {
        "success": True,
        "assessments": assessment_results,
        "stats": stats
    }

@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, current_user: dict = Depends(get_current_user)):
    from bson import ObjectId
    
    assessment = await db.get_collection(ASSESSMENT_COLLECTION).find_one({
        "_id": ObjectId(assessment_id),
        "user_id": current_user["id"]
    })
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return {"success": True, "assessment": AssessmentModel.from_db(assessment)}

async def update_user_stats(user_id: str, score: int):
    stats_collection = db.get_collection("user_stats")
    
    existing = await stats_collection.find_one({"user_id": user_id})
    
    if existing:
        new_total = existing.get("total_assessments", 0) + 1
        new_avg = ((existing.get("average_score", 0) * existing.get("total_assessments", 0)) + score) / new_total
        await stats_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "total_assessments": new_total,
                    "average_score": int(new_avg),
                    "last_assessment_date": datetime.utcnow(),
                    "latest_score": score
                }
            }
        )
    else:
        await stats_collection.insert_one({
            "user_id": user_id,
            "total_assessments": 1,
            "average_score": score,
            "latest_score": score,
            "last_assessment_date": datetime.utcnow()
        })
