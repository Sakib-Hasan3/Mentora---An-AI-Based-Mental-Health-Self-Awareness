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

async def check_appointment_reminders():
    """
    Check bookings scheduled for today and send reminders to users.
    Runs every morning (e.g. 8 AM). Matches booking date with today's date (YYYY-MM-DD).
    """
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # Find all confirmed/pending bookings for today that haven't been reminded yet
    bookings = await db.get_collection("bookings").find({
        "date": today_str,
        "status": {"$in": ["pending", "confirmed"]},
        "reminder_sent": {"$ne": True}  # avoid double notification
    }).to_list(length=200)

    for booking in bookings:
        user_id = booking.get("user_id")
        time    = booking.get("time", "")
        c_id    = booking.get("consultant_id")

        if not user_id:
            continue

        # Fetch consultant name
        consultant_name = "আপনার কনসালট্যান্ট"
        if c_id:
            try:
                from bson import ObjectId
                c = await db.get_collection("consultants").find_one({"_id": ObjectId(c_id)})
                if c:
                    consultant_name = c.get("name_bn") or c.get("name", consultant_name)
            except Exception:
                pass

        await notification_service.notify_appointment_reminder(
            user_id=user_id,
            consultant_name=consultant_name,
            date=today_str,
            time=time
        )

        # Mark reminder as sent so we don't send again
        await db.get_collection("bookings").update_one(
            {"_id": booking["_id"]},
            {"$set": {"reminder_sent": True}}
        )

