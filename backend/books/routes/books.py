
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from auth.dependencies.auth import get_current_user
from core.database import db
from bson import ObjectId
from books.models.books import BookModel, ArticleModel, VideoModel, QuoteModel
from books.schemas.books import (
    BookResponse, ArticleResponse, VideoResponse, QuoteResponse,
    BooksListResponse, ArticlesListResponse, VideosListResponse, QuotesListResponse
)

router = APIRouter(prefix="/books", tags=["Books & Resources"])

BOOKS_COLLECTION = "books"
ARTICLES_COLLECTION = "articles"
VIDEOS_COLLECTION = "videos"
QUOTES_COLLECTION = "quotes"

# ========== BOOKS ==========
@router.get("/books", response_model=BooksListResponse)
async def get_books(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"type": "book"}
    
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"title_bn": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}}
        ]
    
    skip = (page - 1) * limit
    
    books = await db.get_collection(BOOKS_COLLECTION).find(query).skip(skip).limit(limit).to_list(length=limit)
    total = await db.get_collection(BOOKS_COLLECTION).count_documents(query)
    
    return {
        "success": True,
        "books": [BookModel.from_db(b) for b in books],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/books/{book_id}")
async def get_book(book_id: str, current_user: dict = Depends(get_current_user)):
    book = await db.get_collection(BOOKS_COLLECTION).find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    await db.get_collection(BOOKS_COLLECTION).update_one(
        {"_id": ObjectId(book_id)},
        {"$inc": {"read_count": 1}}
    )
    
    return {"success": True, "book": BookModel.from_db(book)}

# ========== ARTICLES ==========
@router.get("/articles", response_model=ArticlesListResponse)
async def get_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"type": "article"}
    if category:
        query["category"] = category
    
    skip = (page - 1) * limit
    
    articles = await db.get_collection(ARTICLES_COLLECTION).find(query).skip(skip).limit(limit).to_list(length=limit)
    total = await db.get_collection(ARTICLES_COLLECTION).count_documents(query)
    
    return {
        "success": True,
        "articles": [ArticleModel.from_db(a) for a in articles],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/articles/{article_id}")
async def get_article(article_id: str, current_user: dict = Depends(get_current_user)):
    article = await db.get_collection(ARTICLES_COLLECTION).find_one({"_id": ObjectId(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.get_collection(ARTICLES_COLLECTION).update_one(
        {"_id": ObjectId(article_id)},
        {"$inc": {"read_count": 1}}
    )
    
    return {"success": True, "article": ArticleModel.from_db(article)}

# ========== VIDEOS ==========
@router.get("/videos", response_model=VideosListResponse)
async def get_videos(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"type": "video"}
    if category:
        query["category"] = category
    
    skip = (page - 1) * limit
    
    videos = await db.get_collection(VIDEOS_COLLECTION).find(query).skip(skip).limit(limit).to_list(length=limit)
    total = await db.get_collection(VIDEOS_COLLECTION).count_documents(query)
    
    return {
        "success": True,
        "videos": [VideoModel.from_db(v) for v in videos],
        "total": total,
        "page": page,
        "limit": limit
    }

# ========== QUOTES ==========
@router.get("/quotes", response_model=QuotesListResponse)
async def get_quotes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"type": "quote"}
    if category:
        query["category"] = category
    
    skip = (page - 1) * limit
    
    quotes = await db.get_collection(QUOTES_COLLECTION).find(query).skip(skip).limit(limit).to_list(length=limit)
    total = await db.get_collection(QUOTES_COLLECTION).count_documents(query)
    
    return {
        "success": True,
        "quotes": [QuoteModel.from_db(q) for q in quotes],
        "total": total,
        "page": page,
        "limit": limit
    }

# ========== FEATURED & CATEGORIES ==========
@router.get("/featured")
async def get_featured(current_user: dict = Depends(get_current_user)):
    featured_books = await db.get_collection(BOOKS_COLLECTION).find({"type": "book"}).sort("read_count", -1).limit(3).to_list(length=3)
    featured_articles = await db.get_collection(ARTICLES_COLLECTION).find({"type": "article"}).sort("read_count", -1).limit(3).to_list(length=3)
    quote_of_day = await db.get_collection(QUOTES_COLLECTION).find({"type": "quote"}).limit(1).to_list(length=1)
    
    return {
        "success": True,
        "featured_books": [BookModel.from_db(b) for b in featured_books],
        "featured_articles": [ArticleModel.from_db(a) for a in featured_articles],
        "quote_of_day": QuoteModel.from_db(quote_of_day[0]) if quote_of_day else None
    }

@router.get("/categories")
async def get_categories(current_user: dict = Depends(get_current_user)):
    categories = [
        {"name": "depression", "name_bn": "বিষণ্ণতা", "icon": "😔", "count": 0},
        {"name": "anxiety", "name_bn": "উদ্বেগ", "icon": "😰", "count": 0},
        {"name": "stress", "name_bn": "স্ট্রেস", "icon": "😫", "count": 0},
        {"name": "mindfulness", "name_bn": "মাইন্ডফুলনেস", "icon": "🧘", "count": 0},
        {"name": "self-care", "name_bn": "সেলফ কেয়ার", "icon": "💆", "count": 0},
        {"name": "motivation", "name_bn": "মোটিভেশন", "icon": "💪", "count": 0}
    ]
    
    return {"success": True, "categories": categories}

# ========== LIKE ==========
@router.post("/{content_type}/{content_id}/like")
async def like_content(
    content_type: str,
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    collection_map = {
        "book": BOOKS_COLLECTION,
        "article": ARTICLES_COLLECTION,
        "video": VIDEOS_COLLECTION,
        "quote": QUOTES_COLLECTION
    }
    
    collection = collection_map.get(content_type)
    if not collection:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    result = await db.get_collection(collection).update_one(
        {"_id": ObjectId(content_id)},
        {"$inc": {"likes": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"success": True, "message": "Liked successfully"}
