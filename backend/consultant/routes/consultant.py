from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from auth.dependencies.auth import get_current_user
from core.database import db
from bson import ObjectId
from consultant.models.consultant import ConsultantModel, BookingModel, ReviewModel
from consultant.schemas.consultant import (
    ConsultantResponse, BookingRequest, BookingResponse,
    ReviewRequest, ReviewResponse, ConsultantsListResponse
)
import uuid
from datetime import datetime

router = APIRouter(prefix="/consultants", tags=["Consultants"])

CONSULTANTS_COLLECTION = "consultants"
BOOKINGS_COLLECTION = "bookings"
REVIEWS_COLLECTION = "reviews"

DEMO_CONSULTANTS = [
    {
        "name": "ডা. সারাহ রহমান",
        "name_bn": "ডা. সারাহ রহমান",
        "degree": "ক্লিনিক্যাল সাইকোলজিস্ট (MSc)",
        "specialization": ["ডিপ্রেশন", "এংজাইটি", "স্ট্রেস"],
        "experience_years": 8,
        "division": "ঢাকা",
        "district": "ঢাকা",
        "address": "ধানমন্ডি, ঢাকা",
        "fee": 1000,
        "rating": 4.8,
        "total_reviews": 127,
        "available_days": ["সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র"],
        "available_time_start": "10:00",
        "available_time_end": "18:00",
        "online_available": True,
        "phone": "01712345678",
        "email": "sarah@mentora.com",
        "bio": "প্রায় ৮ বছর ধরে মানসিক স্বাস্থ্য সেবা প্রদান করে আসছি। বিশেষভাবে বিষণ্ণতা ও উদ্বেগজনিত সমস্যায় অভিজ্ঞ।",
        "image": "/consultants/sarah.jpg"
    },
    {
        "name": "প্রফেসর ড. মো. জাহিদ হাসান",
        "name_bn": "প্রফেসর ড. মো. জাহিদ হাসান",
        "degree": "সাইকিয়াট্রিস্ট (MD)",
        "specialization": ["সাইকোসিস", "বাইপোলার", "ডিপ্রেশন"],
        "experience_years": 15,
        "division": "ঢাকা",
        "district": "গাজীপুর",
        "address": "গাজীপুর সিটি, ঢাকা",
        "fee": 1500,
        "rating": 4.9,
        "total_reviews": 234,
        "available_days": ["রবি", "সোম", "বুধ", "বৃহস্পতি"],
        "available_time_start": "11:00",
        "available_time_end": "19:00",
        "online_available": True,
        "phone": "01812345678",
        "email": "zahid@mentora.com",
        "bio": "১৫ বছরের অভিজ্ঞতা সম্পন্ন সাইকিয়াট্রিস্ট। বাইপোলার ডিসঅর্ডার ও সাইকোসিস চিকিৎসায় বিশেষজ্ঞ।",
        "image": "/consultants/zahid.jpg"
    },
    {
        "name": "ডা. নাজমুন নাহার",
        "name_bn": "ডা. নাজমুন নাহার",
        "degree": "চাইল্ড সাইকোলজিস্ট",
        "specialization": ["চাইল্ড সাইকোলজি", "প্যারেন্টিং", "ADHD"],
        "experience_years": 6,
        "division": "চট্টগ্রাম",
        "district": "চট্টগ্রাম",
        "address": "নাসিরাবাদ, চট্টগ্রাম",
        "fee": 800,
        "rating": 4.7,
        "total_reviews": 89,
        "available_days": ["মঙ্গল", "বুধ", "শুক্র", "শনি"],
        "available_time_start": "09:00",
        "available_time_end": "17:00",
        "online_available": True,
        "phone": "01912345678",
        "email": "nazmun@mentora.com",
        "bio": "শিশু-কিশোরদের মানসিক স্বাস্থ্য ও অভিভাবকদের কাউন্সেলিং এ বিশেষজ্ঞ।",
        "image": "/consultants/nazmun.jpg"
    },
    {
        "name": "ডা. রফিকুল ইসলাম",
        "name_bn": "ডা. রফিকুল ইসলাম",
        "degree": "কগনিটিভ বিহেভিওরাল থেরাপিস্ট",
        "specialization": ["CBT", "স্ট্রেস", "ট্রমা"],
        "experience_years": 10,
        "division": "রাজশাহী",
        "district": "রাজশাহী",
        "address": "সাহেব বাজার, রাজশাহী",
        "fee": 1200,
        "rating": 4.8,
        "total_reviews": 156,
        "available_days": ["রবি", "মঙ্গল", "বৃহস্পতি", "শুক্র"],
        "available_time_start": "10:00",
        "available_time_end": "20:00",
        "online_available": True,
        "phone": "01798765432",
        "email": "rafiq@mentora.com",
        "bio": "CBT থেরাপির মাধ্যমে স্ট্রেস ও ট্রমা ব্যবস্থাপনায় দক্ষ।",
        "image": "/consultants/rafiq.jpg"
    }
]

@router.on_event("startup")
async def init_consultants():
    for consultant in DEMO_CONSULTANTS:
        existing = await db.get_collection(CONSULTANTS_COLLECTION).find_one({"email": consultant["email"]})
        if not existing:
            await db.get_collection(CONSULTANTS_COLLECTION).insert_one(ConsultantModel.create(consultant))

@router.get("/", response_model=ConsultantsListResponse)
async def get_consultants(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    division: Optional[str] = None,
    specialization: Optional[str] = None,
    min_rating: Optional[float] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"is_active": True}
    if division:
        query["division"] = division
    if specialization:
        query["specialization"] = {"$in": [specialization]}
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    
    skip = (page - 1) * limit
    consultants = await db.get_collection(CONSULTANTS_COLLECTION).find(query).skip(skip).limit(limit).to_list(length=limit)
    total = await db.get_collection(CONSULTANTS_COLLECTION).count_documents(query)
    
    return {
        "success": True,
        "consultants": [ConsultantModel.from_db(c) for c in consultants],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{consultant_id}", response_model=ConsultantResponse)
async def get_consultant(consultant_id: str, current_user: dict = Depends(get_current_user)):
    consultant = await db.get_collection(CONSULTANTS_COLLECTION).find_one({"_id": ObjectId(consultant_id)})
    if not consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    return ConsultantModel.from_db(consultant)

@router.get("/{consultant_id}/reviews")
async def get_consultant_reviews(consultant_id: str, current_user: dict = Depends(get_current_user)):
    reviews = await db.get_collection(REVIEWS_COLLECTION).find({"consultant_id": consultant_id}).sort("created_at", -1).to_list(length=50)
    return {"success": True, "reviews": [ReviewModel.from_db(r) for r in reviews]}

@router.post("/{consultant_id}/book", response_model=BookingResponse)
async def book_appointment(
    consultant_id: str,
    booking_data: BookingRequest,
    current_user: dict = Depends(get_current_user)
):
    consultant = await db.get_collection(CONSULTANTS_COLLECTION).find_one({"_id": ObjectId(consultant_id)})
    if not consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    
    existing_booking = await db.get_collection(BOOKINGS_COLLECTION).find_one({
        "consultant_id": consultant_id,
        "date": booking_data.date,
        "time": booking_data.time,
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    meeting_link = None
    if booking_data.type == "online":
        meeting_link = f"https://meet.google.com/{uuid.uuid4().hex[:8]}"
    
    booking_doc = BookingModel.create({
        "consultant_id": consultant_id,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "user_email": current_user["email"],
        "user_phone": current_user.get("phone", ""),
        "date": booking_data.date,
        "time": booking_data.time,
        "type": booking_data.type,
        "meeting_link": meeting_link,
        "notes": booking_data.notes
    })
    
    result = await db.get_collection(BOOKINGS_COLLECTION).insert_one(booking_doc)
    
    return {
        "success": True,
        "message": "Appointment booked successfully!",
        "booking_id": str(result.inserted_id),
        "meeting_link": meeting_link
    }

@router.get("/my-bookings")
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    bookings = await db.get_collection(BOOKINGS_COLLECTION).find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).to_list(length=50)
    
    result = []
    for booking in bookings:
        consultant = await db.get_collection(CONSULTANTS_COLLECTION).find_one({"_id": ObjectId(booking["consultant_id"])})
        result.append({
            "id": str(booking["_id"]),
            "consultant_name": consultant["name"] if consultant else "Unknown",
            "consultant_name_bn": consultant.get("name_bn") if consultant else "Unknown",
            "date": booking["date"],
            "time": booking["time"],
            "type": booking["type"],
            "meeting_link": booking.get("meeting_link"),
            "status": booking["status"],
            "created_at": booking["created_at"]
        })
    
    return {"success": True, "bookings": result}

@router.put("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    booking = await db.get_collection(BOOKINGS_COLLECTION).find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")
    
    await db.get_collection(BOOKINGS_COLLECTION).update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "message": "Booking cancelled successfully"}

@router.post("/{consultant_id}/review", response_model=ReviewResponse)
async def add_review(
    consultant_id: str,
    review_data: ReviewRequest,
    current_user: dict = Depends(get_current_user)
):
    consultant = await db.get_collection(CONSULTANTS_COLLECTION).find_one({"_id": ObjectId(consultant_id)})
    if not consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    
    review_doc = ReviewModel.create({
        "consultant_id": consultant_id,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "rating": review_data.rating,
        "comment": review_data.comment
    })
    
    await db.get_collection(REVIEWS_COLLECTION).insert_one(review_doc)
    
    reviews = await db.get_collection(REVIEWS_COLLECTION).find({"consultant_id": consultant_id}).to_list(length=100)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    total_reviews = len(reviews)
    
    await db.get_collection(CONSULTANTS_COLLECTION).update_one(
        {"_id": ObjectId(consultant_id)},
        {"$set": {"rating": round(avg_rating, 1), "total_reviews": total_reviews}}
    )
    
    return {"success": True, "message": "Review added successfully"}
