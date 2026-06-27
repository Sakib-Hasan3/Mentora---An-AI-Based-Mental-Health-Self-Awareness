from datetime import datetime
from typing import Dict, List, Optional

class ContentModel:
    @staticmethod
    def create(data: Dict) -> Dict:
        return {
            "type": data.get("type"),
            "title": data.get("title"),
            "title_bn": data.get("title_bn", data.get("title")),
            "content": data.get("content"),
            "content_bn": data.get("content_bn", data.get("content")),
            "author": data.get("author"),
            "category": data.get("category"),
            "tags": data.get("tags", []),
            "image_url": data.get("image_url"),
            "video_url": data.get("video_url"),
            "source": data.get("source"),
            "is_published": data.get("is_published", True),
            "featured": data.get("featured", False),
            "views": 0,
            "likes": 0,
            "created_by": data.get("created_by"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def from_db(item: Dict) -> Dict:
        return {
            "id": str(item["_id"]),
            "type": item.get("type"),
            "title": item.get("title"),
            "title_bn": item.get("title_bn"),
            "content": item.get("content"),
            "content_bn": item.get("content_bn"),
            "author": item.get("author"),
            "category": item.get("category"),
            "tags": item.get("tags", []),
            "image_url": item.get("image_url"),
            "video_url": item.get("video_url"),
            "source": item.get("source"),
            "is_published": item.get("is_published", True),
            "featured": item.get("featured", False),
            "views": item.get("views", 0),
            "likes": item.get("likes", 0),
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at")
        }
