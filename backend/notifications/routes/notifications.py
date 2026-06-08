from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from auth.dependencies.auth import get_current_user
from core.database import db
from bson import ObjectId
from notifications.models.notifications import NotificationModel
from notifications.services.notification_service import notification_service
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications"])

NOTIFICATIONS_COLLECTION = "notifications"

@router.get("/")
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    is_read: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    
    query = {"user_id": user_id}
    if type:
        query["type"] = type
    if is_read is not None:
        query["is_read"] = is_read
    
    skip = (page - 1) * limit
    
    notifications = await db.get_collection(NOTIFICATIONS_COLLECTION).find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    total = await db.get_collection(NOTIFICATIONS_COLLECTION).count_documents(query)
    unread_count = await db.get_collection(NOTIFICATIONS_COLLECTION).count_documents({"user_id": user_id, "is_read": False})
    
    return {
        "success": True,
        "notifications": [NotificationModel.from_db(n) for n in notifications],
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "limit": limit
    }

@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    unread_count = await db.get_collection(NOTIFICATIONS_COLLECTION).count_documents({"user_id": user_id, "is_read": False})
    return {"success": True, "unread_count": unread_count}

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    
    notification = await db.get_collection(NOTIFICATIONS_COLLECTION).find_one({"_id": ObjectId(notification_id)})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.get_collection(NOTIFICATIONS_COLLECTION).update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "message": "Marked as read"}

@router.put("/mark-all-read")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    await db.get_collection(NOTIFICATIONS_COLLECTION).update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    
    notification = await db.get_collection(NOTIFICATIONS_COLLECTION).find_one({"_id": ObjectId(notification_id)})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.get_collection(NOTIFICATIONS_COLLECTION).delete_one({"_id": ObjectId(notification_id)})
    
    return {"success": True, "message": "Notification deleted"}

@router.post("/send-test")
async def send_test_notification(current_user: dict = Depends(get_current_user)):
    # This is for testing - sends a real notification
    notif_id = await notification_service.create_notification(
        user_id=current_user["id"],
        title="Test Notification",
        title_bn="টেস্ট নোটিফিকেশন",
        message="This is a production test notification.",
        message_bn="এটি একটি প্রোডাকশন টেস্ট নোটিফিকেশন।",
        notif_type="info",
        icon="🔔",
        link="/dashboard"
    )
    
    return {"success": True, "message": "Test notification sent", "notification_id": notif_id}
