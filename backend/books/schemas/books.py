
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BookResponse(BaseModel):
    id: str
    title: str
    title_bn: Optional[str] = None
    author: str
    category: str
    type: str
    description: Optional[str] = None
    description_bn: Optional[str] = None
    cover_image: Optional[str] = None
    file_url: Optional[str] = None
    read_count: int = 0
    likes: int = 0
    rating: float = 0
    tags: List[str] = []

class ArticleResponse(BaseModel):
    id: str
    title: str
    title_bn: Optional[str] = None
    author: str
    category: str
    type: str
    content: Optional[str] = None
    content_bn: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    read_time: int = 5
    read_count: int = 0
    likes: int = 0
    tags: List[str] = []

class VideoResponse(BaseModel):
    id: str
    title: str
    title_bn: Optional[str] = None
    channel: str
    category: str
    type: str
    youtube_url: str
    duration: str = "10:00"
    description: Optional[str] = None
    description_bn: Optional[str] = None
    thumbnail: Optional[str] = None
    views: int = 0
    likes: int = 0
    tags: List[str] = []

class QuoteResponse(BaseModel):
    id: str
    text: str
    text_bn: Optional[str] = None
    author: str
    category: str
    type: str
    likes: int = 0
    tags: List[str] = []

class CategoryResponse(BaseModel):
    name: str
    name_bn: str
    count: int
    icon: str

class BooksListResponse(BaseModel):
    success: bool
    books: List[BookResponse]
    total: int
    page: int
    limit: int

class ArticlesListResponse(BaseModel):
    success: bool
    articles: List[ArticleResponse]
    total: int
    page: int
    limit: int

class VideosListResponse(BaseModel):
    success: bool
    videos: List[VideoResponse]
    total: int
    page: int
    limit: int

class QuotesListResponse(BaseModel):
    success: bool
    quotes: List[QuoteResponse]
    total: int
    page: int
    limit: int
