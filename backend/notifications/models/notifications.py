from datetime import datetime, timezone
from typing import Dict, Optional

class NotificationModel:
    @staticmethod
    def create(data: Dict) -> Dict:
        now = datetime.now(timezone.utc)
        return {
            "user_id": data.get("user_id"),
            "title": data.get("title"),
            "title_bn": data.get("title_bn", data.get("title")),
            "message": data.get("message"),
            "message_bn": data.get("message_bn", data.get("message")),
            "type": data.get("type", "info"),
            "icon": data.get("icon", "🔔"),
            "link": data.get("link"),
            "metadata": data.get("metadata", {}),
            "is_read": False,
            "created_at": now,
            "updated_at": now
        }
    
    @staticmethod
    def from_db(notification: Dict) -> Dict:
        return {
            "id": str(notification["_id"]),
            "title": notification.get("title"),
            "title_bn": notification.get("title_bn"),
            "message": notification.get("message"),
            "message_bn": notification.get("message_bn"),
            "type": notification.get("type"),
            "icon": notification.get("icon"),
            "link": notification.get("link"),
            "metadata": notification.get("metadata", {}),
            "is_read": notification.get("is_read", False),
            "created_at": notification.get("created_at")
        }
