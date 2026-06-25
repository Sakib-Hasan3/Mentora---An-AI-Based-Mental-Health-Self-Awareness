from datetime import datetime, timezone


class UserModel:
    """ইউজার ডাটাবেস ডকুমেন্ট তৈরির helper model."""

    collection_name = "users"

    @staticmethod
    def create(name: str, email: str, hashed_password: str) -> dict:
        """নতুন ইউজার ডকুমেন্ট বানায়।"""

        return {
            "name": name.strip(),
            "email": email.strip().lower(),
            "hashed_password": hashed_password,
            "is_active": True,
            "user_type": "free",  # "free" or "paid"
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

    @staticmethod
    def from_db(user_document: dict | None) -> dict | None:
        """ডাটাবেস ডকুমেন্টকে response-friendly JSON বানায়।"""

        if not user_document:
            return None

        return {
            "id": str(user_document["_id"]),
            "name": user_document.get("name", ""),
            "email": user_document.get("email", ""),
            "is_active": user_document.get("is_active", True),
            "user_type": user_document.get("user_type", "free"),
        }
