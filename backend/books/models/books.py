
from datetime import datetime
from typing import List, Dict, Optional

class BookModel:
    @staticmethod
    def create_book(data: Dict) -> Dict:
        return {
            "title": data.get("title"),
            "title_bn": data.get("title_bn", data.get("title")),
            "author": data.get("author"),
            "category": data.get("category"),
            "type": "book",
            "description": data.get("description"),
            "description_bn": data.get("description_bn", data.get("description")),
            "cover_image": data.get("cover_image", "/books/default.jpg"),
            "file_url": data.get("file_url"),
            "read_count": 0,
            "likes": 0,
            "rating": data.get("rating", 0),
            "tags": data.get("tags", []),
            "created_at": datetime.utcnow()
        }
    
    @staticmethod
    def from_db(book: Dict) -> Dict:
        return {
            "id": str(book["_id"]),
            "title": book.get("title"),
            "title_bn": book.get("title_bn"),
            "author": book.get("author"),
            "category": book.get("category"),
            "type": book.get("type"),
            "description": book.get("description"),
            "description_bn": book.get("description_bn"),
            "cover_image": book.get("cover_image"),
            "file_url": book.get("file_url"),
            "read_count": book.get("read_count", 0),
            "likes": book.get("likes", 0),
            "rating": book.get("rating", 0),
            "tags": book.get("tags", [])
        }

class ArticleModel:
    @staticmethod
    def create_article(data: Dict) -> Dict:
        return {
            "title": data.get("title"),
            "title_bn": data.get("title_bn", data.get("title")),
            "author": data.get("author"),
            "category": data.get("category"),
            "type": "article",
            "content": data.get("content"),
            "content_bn": data.get("content_bn", data.get("content")),
            "excerpt": data.get("excerpt", data.get("content")[:150]),
            "cover_image": data.get("cover_image", "/articles/default.jpg"),
            "read_time": data.get("read_time", 5),
            "read_count": 0,
            "likes": 0,
            "tags": data.get("tags", []),
            "created_at": datetime.utcnow()
        }
    
    @staticmethod
    def from_db(article: Dict) -> Dict:
        return {
            "id": str(article["_id"]),
            "title": article.get("title"),
            "title_bn": article.get("title_bn"),
            "author": article.get("author"),
            "category": article.get("category"),
            "type": article.get("type"),
            "content": article.get("content"),
            "content_bn": article.get("content_bn"),
            "excerpt": article.get("excerpt"),
            "cover_image": article.get("cover_image"),
            "read_time": article.get("read_time", 5),
            "read_count": article.get("read_count", 0),
            "likes": article.get("likes", 0),
            "tags": article.get("tags", [])
        }

class VideoModel:
    @staticmethod
    def create_video(data: Dict) -> Dict:
        return {
            "title": data.get("title"),
            "title_bn": data.get("title_bn", data.get("title")),
            "channel": data.get("channel"),
            "category": data.get("category"),
            "type": "video",
            "youtube_url": data.get("youtube_url"),
            "duration": data.get("duration", "10:00"),
            "description": data.get("description"),
            "description_bn": data.get("description_bn", data.get("description")),
            "thumbnail": data.get("thumbnail"),
            "views": 0,
            "likes": 0,
            "tags": data.get("tags", []),
            "created_at": datetime.utcnow()
        }
    
    @staticmethod
    def from_db(video: Dict) -> Dict:
        return {
            "id": str(video["_id"]),
            "title": video.get("title"),
            "title_bn": video.get("title_bn"),
            "channel": video.get("channel"),
            "category": video.get("category"),
            "type": video.get("type"),
            "youtube_url": video.get("youtube_url"),
            "duration": video.get("duration"),
            "description": video.get("description"),
            "description_bn": video.get("description_bn"),
            "thumbnail": video.get("thumbnail"),
            "views": video.get("views", 0),
            "likes": video.get("likes", 0),
            "tags": video.get("tags", [])
        }

class QuoteModel:
    @staticmethod
    def create_quote(data: Dict) -> Dict:
        return {
            "text": data.get("text"),
            "text_bn": data.get("text_bn", data.get("text")),
            "author": data.get("author"),
            "category": data.get("category"),
            "type": "quote",
            "likes": 0,
            "tags": data.get("tags", []),
            "created_at": datetime.utcnow()
        }
    
    @staticmethod
    def from_db(quote: Dict) -> Dict:
        return {
            "id": str(quote["_id"]),
            "text": quote.get("text"),
            "text_bn": quote.get("text_bn"),
            "author": quote.get("author"),
            "category": quote.get("category"),
            "type": quote.get("type"),
            "likes": quote.get("likes", 0),
            "tags": quote.get("tags", [])
        }
