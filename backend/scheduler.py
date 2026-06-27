"""
scheduler.py — Mentora Background Job Scheduler
Uses APScheduler for reliable cron-based task scheduling.
Jobs survive application restarts via in-memory store
(upgrade to MongoDB job store for true persistence).
"""
import logging
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED

from core.database import db
from notifications.services.notification_service import notification_service

logger = logging.getLogger(__name__)


# ─── Job Functions ────────────────────────────────────────────────────────

async def check_assessment_reminders() -> None:
    """
    Send reminders to users who haven't taken an assessment in 7+ days.
    Runs daily at 10:00 AM UTC.
    """
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    pipeline = [
        {"$match": {"created_at": {"$lt": seven_days_ago}}},
        {"$group": {
            "_id": "$user_id",
            "last_assessment": {"$max": "$created_at"},
        }},
        {"$match": {"last_assessment": {"$lt": seven_days_ago}}},
    ]

    try:
        users = await db.get_collection("assessments").aggregate(pipeline).to_list(length=200)
        count = 0
        for user in users:
            days_ago = (datetime.now(timezone.utc) - user["last_assessment"]).days
            await notification_service.notify_assessment_reminder(
                user_id=str(user["_id"]),
                days_ago=days_ago,
            )
            count += 1
        logger.info("📋 Assessment reminders sent: %d", count)
    except Exception as exc:
        logger.error("Assessment reminder job failed: %s", exc, exc_info=True)


async def send_daily_meditation_reminder() -> None:
    """
    Send daily meditation reminder to all active users.
    Runs daily at 8:00 AM UTC.
    """
    try:
        users = await db.get_collection("users").find(
            {"is_active": True},
            {"_id": 1},   # Only fetch _id for efficiency
        ).to_list(length=500)

        count = 0
        for user in users:
            await notification_service.notify_meditation_reminder(
                user_id=str(user["_id"]),
            )
            count += 1
        logger.info("🧘 Meditation reminders sent: %d", count)
    except Exception as exc:
        logger.error("Meditation reminder job failed: %s", exc, exc_info=True)


async def check_appointment_reminders() -> None:
    """
    Send same-day appointment reminders to users with bookings today.
    Runs daily at 8:00 AM UTC.
    Marks bookings as reminded to prevent duplicate notifications.
    """
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    try:
        bookings = await db.get_collection("bookings").find({
            "date": today_str,
            "status": {"$in": ["pending", "confirmed"]},
            "reminder_sent": {"$ne": True},
        }).to_list(length=500)

        count = 0
        for booking in bookings:
            user_id = booking.get("user_id")
            if not user_id:
                continue

            consultant_name = "আপনার কনসালট্যান্ট"
            c_id = booking.get("consultant_id")
            if c_id:
                try:
                    from bson import ObjectId
                    c = await db.get_collection("consultants").find_one(
                        {"_id": ObjectId(c_id)},
                        {"name": 1, "name_bn": 1},
                    )
                    if c:
                        consultant_name = c.get("name_bn") or c.get("name", consultant_name)
                except Exception:
                    pass

            await notification_service.notify_appointment_reminder(
                user_id=str(user_id),
                consultant_name=consultant_name,
                date=today_str,
                time=booking.get("time", ""),
            )

            await db.get_collection("bookings").update_one(
                {"_id": booking["_id"]},
                {"$set": {"reminder_sent": True}},
            )
            count += 1

        logger.info("🏥 Appointment reminders sent: %d", count)
    except Exception as exc:
        logger.error("Appointment reminder job failed: %s", exc, exc_info=True)


# ─── Scheduler Factory ────────────────────────────────────────────────────

def create_scheduler() -> AsyncIOScheduler:
    """
    Build and configure the APScheduler instance.
    Call start() on the returned scheduler after the event loop is running.
    """
    scheduler = AsyncIOScheduler(timezone="UTC")

    # ── Job: Daily meditation reminder @ 08:00 UTC ──────────────────────
    scheduler.add_job(
        send_daily_meditation_reminder,
        trigger=CronTrigger(hour=8, minute=0),
        id="daily_meditation",
        name="Daily Meditation Reminder",
        replace_existing=True,
        misfire_grace_time=300,   # Run up to 5 min late if server was down
    )

    # ── Job: Appointment reminders @ 08:05 UTC (after meditation) ───────
    scheduler.add_job(
        check_appointment_reminders,
        trigger=CronTrigger(hour=8, minute=5),
        id="appointment_reminders",
        name="Appointment Reminders",
        replace_existing=True,
        misfire_grace_time=300,
    )

    # ── Job: Assessment reminders @ 10:00 UTC ───────────────────────────
    scheduler.add_job(
        check_assessment_reminders,
        trigger=CronTrigger(hour=10, minute=0),
        id="assessment_reminders",
        name="Assessment Reminders",
        replace_existing=True,
        misfire_grace_time=300,
    )

    # ── Event listener for job errors ────────────────────────────────────
    def _on_job_event(event):
        if event.exception:
            logger.error(
                "Scheduled job '%s' crashed: %s",
                event.job_id, event.exception,
                exc_info=True,
            )
        else:
            logger.debug("Scheduled job '%s' completed", event.job_id)

    scheduler.add_listener(_on_job_event, EVENT_JOB_ERROR | EVENT_JOB_EXECUTED)

    return scheduler
