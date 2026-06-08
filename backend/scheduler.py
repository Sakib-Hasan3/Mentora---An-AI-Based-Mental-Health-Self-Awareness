import asyncio
from datetime import datetime, timedelta
from core.database import db
from notifications.services.notification_service import notification_service

async def check_assessment_reminders():
    """Check users who haven't taken assessment in last 7 days"""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Find users who have taken assessment more than 7 days ago
    pipeline = [
        {"$match": {"created_at": {"$lt": seven_days_ago}}},
        {"$group": {
            "_id": "$user_id",
            "last_assessment": {"$max": "$created_at"}
        }}
    ]
    
    users = await db.get_collection("assessments").aggregate(pipeline).to_list(length=100)
    
    for user in users:
        days_ago = (datetime.utcnow() - user["last_assessment"]).days
        await notification_service.notify_assessment_reminder(
            user_id=user["_id"],
            days_ago=days_ago
        )

async def send_daily_meditation_reminder():
    """Send daily meditation reminder to all active users"""
    users = await db.get_collection("users").find({"is_active": True}).to_list(length=100)
    
    for user in users:
        await notification_service.notify_meditation_reminder(user_id=user["_id"])
