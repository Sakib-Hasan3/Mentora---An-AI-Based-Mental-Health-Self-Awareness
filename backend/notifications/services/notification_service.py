from core.database import db
from notifications.models.notifications import NotificationModel
from datetime import datetime, timezone
from bson import ObjectId

NOTIFICATIONS_COLLECTION = "notifications"

class NotificationService:
    
    @staticmethod
    async def create_notification(
        user_id: str,
        title: str,
        message: str,
        notif_type: str = "info",
        icon: str = "🔔",
        link: str = None,
        title_bn: str = None,
        message_bn: str = None,
        metadata: dict = None
    ):
        notification = NotificationModel.create({
            "user_id": user_id,
            "title": title,
            "title_bn": title_bn or title,
            "message": message,
            "message_bn": message_bn or message,
            "type": notif_type,
            "icon": icon,
            "link": link,
            "metadata": metadata or {}
        })
        
        result = await db.get_collection(NOTIFICATIONS_COLLECTION).insert_one(notification)
        return str(result.inserted_id)
    
    @staticmethod
    async def notify_assessment_completed(user_id: str, score: int, level: str):
        return await NotificationService.create_notification(
            user_id=user_id,
            title="Assessment Completed",
            title_bn="পরীক্ষা সম্পন্ন হয়েছে",
            message=f"You scored {score}% - {level}. View your detailed report.",
            message_bn=f"আপনার স্কোর {score}% - {level}. আপনার বিস্তারিত রিপোর্ট দেখুন।",
            notif_type="success",
            icon="📊",
            link="/progress"
        )
    
    @staticmethod
    async def notify_booking_confirmed(user_id: str, consultant_name: str, date: str, time: str):
        return await NotificationService.create_notification(
            user_id=user_id,
            title="Booking Confirmed",
            title_bn="অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে",
            message=f"Your appointment with {consultant_name} on {date} at {time} is confirmed.",
            message_bn=f"{consultant_name} এর সাথে {date} তারিখ {time} সময়ে আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে।",
            notif_type="success",
            icon="✅",
            link="/consultants/my-bookings"
        )
    
    @staticmethod
    async def notify_community_activity(user_id: str, post_title: str, post_id: str):
        return await NotificationService.create_notification(
            user_id=user_id,
            title="New Community Activity",
            title_bn="নতুন কমিউনিটি কার্যকলাপ",
            message=f"New reply on your post: {post_title[:50]}",
            message_bn=f"আপনার পোস্টে নতুন উত্তর: {post_title[:50]}",
            notif_type="info",
            icon="💬",
            link=f"/community/post/{post_id}"
        )
    
    @staticmethod
    async def notify_assessment_reminder(user_id: str, days_ago: int):
        return await NotificationService.create_notification(
            user_id=user_id,
            title="Assessment Reminder",
            title_bn="পরীক্ষা রিমাইন্ডার",
            message=f"It's been {days_ago} days since your last assessment. Take a new one!",
            message_bn=f"আপনার শেষ পরীক্ষা দেওয়ার {days_ago} দিন হয়ে গেছে। নতুন পরীক্ষা দিন!",
            notif_type="warning",
            icon="⏰",
            link="/assessment"
        )
    
    @staticmethod
    async def notify_stress_alert(user_id: str, stress_level: int):
        level_text = "high" if stress_level > 70 else "moderate"
        return await NotificationService.create_notification(
            user_id=user_id,
            title="Stress Level Alert",
            title_bn="স্ট্রেস লেভেল সতর্কতা",
            message=f"Your stress level is {level_text} ({stress_level}%). Consider taking a break.",
            message_bn=f"আপনার স্ট্রেস লেভেল {level_text} ({stress_level}%)। একটু বিরতি নিন।",
            notif_type="error",
            icon="⚠️",
            link="/stress-management"
        )
    
    @staticmethod
    async def notify_meditation_reminder(user_id: str):
        return await NotificationService.create_notification(
            user_id=user_id,
            title="Meditation Time",
            title_bn="মেডিটেশন সময়",
            message="Time for your daily meditation session. Take 10 minutes for yourself.",
            message_bn="আপনার দৈনিক মেডিটেশন সেশনের সময়। নিজের জন্য ১০ মিনিট বের করুন।",
            notif_type="info",
            icon="🧘",
            link="/meditation"
        )
    
    @staticmethod
    async def notify_appointment_reminder(user_id: str, consultant_name: str, date: str, time: str):
        return await NotificationService.create_notification(
            user_id=user_id,
            title="Today's Appointment Reminder",
            title_bn="আজকের অ্যাপয়েন্টমেন্ট রিমাইন্ডার",
            message=f"Reminder: You have an appointment with {consultant_name} today at {time}.",
            message_bn=f"স্মরণ করিয়ে দিচ্ছি: আজ {time} সময়ে {consultant_name} এর সাথে আপনার অ্যাপয়েন্টমেন্ট রয়েছে।",
            notif_type="warning",
            icon="🏥",
            link="/consultants"
        )

    
    @staticmethod
    async def notify_book_reminder(user_id: str, book_title: str):
        return await NotificationService.create_notification(
            user_id=user_id,
            title="Continue Reading",
            title_bn="পড়া চালিয়ে যান",
            message=f"You haven't finished reading '{book_title}'. Continue where you left off.",
            message_bn=f"আপনি '{book_title}' বইটি শেষ করেননি। যেখানে ছেড়েছিলেন সেখান থেকে পড়ুন।",
            notif_type="info",
            icon="📚",
            link="/books"
        )
    
    @staticmethod
    async def send_bulk_notification(user_ids: list, title: str, message: str, notif_type: str = "info", icon: str = "🔔"):
        notifications = []
        now = datetime.now(timezone.utc)
        for user_id in user_ids:
            notifications.append(NotificationModel.create({
                "user_id": user_id,
                "title": title,
                "title_bn": title,
                "message": message,
                "message_bn": message,
                "type": notif_type,
                "icon": icon,
                "is_read": False,
                "created_at": now,
                "updated_at": now
            }))
        
        if notifications:
            await db.get_collection(NOTIFICATIONS_COLLECTION).insert_many(notifications)
        return len(notifications)

notification_service = NotificationService()
