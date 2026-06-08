from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime
from auth.dependencies.auth import get_current_user
from core.database import db
from bson import ObjectId
from community.models.community import PostModel, CommentModel
from community.schemas.community import (
    CreatePost, UpdatePost, CreateComment,
    PostResponse, PostDetailResponse, PostsListResponse
)

router = APIRouter(prefix="/community", tags=["Community"])

POSTS_COLLECTION = "community_posts"
LIKES_COLLECTION = "community_likes"

# Divisions of Bangladesh
DIVISIONS = [
    {"name": "ঢাকা", "districts": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ"]},
    {"name": "চট্টগ্রাম", "districts": ["চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ফেনী", "ব্রাহ্মণবাড়িয়া"]},
    {"name": "রাজশাহী", "districts": ["রাজশাহী", "বগুড়া", "পাবনা", "নওগাঁ", "নাটোর"]},
    {"name": "খুলনা", "districts": ["খুলনা", "যশোর", "সাতক্ষীরা", "কুষ্টিয়া", "ঝিনাইদহ"]},
    {"name": "বরিশাল", "districts": ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর"]},
    {"name": "সিলেট", "districts": ["সিলেট", "হবিগঞ্জ", "মৌলভীবাজার", "সুনামগঞ্জ"]},
    {"name": "রংপুর", "districts": ["রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "নীলফামারী"]},
    {"name": "ময়মনসিংহ", "districts": ["ময়মনসিংহ", "জামালপুর", "শেরপুর", "নেত্রকোণা"]}
]

# ========== POSTS ==========

@router.get("/divisions")
async def get_divisions(current_user: dict = Depends(get_current_user)):
    return {"success": True, "divisions": DIVISIONS}

@router.post("/posts", response_model=dict)
async def create_post(
    post_data: CreatePost,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    user_name = current_user["name"]
    
    post_doc = PostModel.create({
        "user_id": user_id,
        "user_name": user_name,
        "division": post_data.division,
        "district": post_data.district,
        "title": post_data.title,
        "content": post_data.content,
        "is_anonymous": post_data.is_anonymous,
        "tags": post_data.tags
    })
    
    result = await db.get_collection(POSTS_COLLECTION).insert_one(post_doc)
    
    return {
        "success": True,
        "message": "পোস্ট সফলভাবে তৈরি হয়েছে",
        "post_id": str(result.inserted_id)
    }

@router.get("/posts", response_model=PostsListResponse)
async def get_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    division: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if division:
        query["division"] = division
    
    skip = (page - 1) * limit
    
    posts = await db.get_collection(POSTS_COLLECTION).find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    total = await db.get_collection(POSTS_COLLECTION).count_documents(query)
    
    return {
        "success": True,
        "posts": [PostModel.from_db(p) for p in posts],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/posts/{post_id}", response_model=PostDetailResponse)
async def get_post(post_id: str, current_user: dict = Depends(get_current_user)):
    post = await db.get_collection(POSTS_COLLECTION).find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = post.get("comments", [])
    
    return {
        "post": PostModel.from_db(post),
        "comments": [CommentModel.from_db(c) for c in comments]
    }

@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    post_data: UpdatePost,
    current_user: dict = Depends(get_current_user)
):
    post = await db.get_collection(POSTS_COLLECTION).find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only update your own posts")
    
    update_data = {}
    if post_data.title:
        update_data["title"] = post_data.title
    if post_data.content:
        update_data["content"] = post_data.content
    if post_data.tags:
        update_data["tags"] = post_data.tags
    update_data["updated_at"] = datetime.utcnow()
    
    await db.get_collection(POSTS_COLLECTION).update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_data}
    )
    
    return {"success": True, "message": "পোস্ট আপডেট হয়েছে"}

@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    post = await db.get_collection(POSTS_COLLECTION).find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["user_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    
    await db.get_collection(POSTS_COLLECTION).delete_one({"_id": ObjectId(post_id)})
    
    return {"success": True, "message": "পোস্ট ডিলিট হয়েছে"}

# ========== LIKES ==========

@router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    post = await db.get_collection(POSTS_COLLECTION).find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    
    if user_id in likes:
        await db.get_collection(POSTS_COLLECTION).update_one(
            {"_id": ObjectId(post_id)},
            {"$pull": {"likes": user_id}}
        )
        return {"success": True, "message": "লাইক রিমুভ হয়েছে"}
    else:
        await db.get_collection(POSTS_COLLECTION).update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"likes": user_id}}
        )
        return {"success": True, "message": "লাইক দেওয়া হয়েছে"}

# ========== COMMENTS ==========

@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    comment_data: CreateComment,
    current_user: dict = Depends(get_current_user)
):
    post = await db.get_collection(POSTS_COLLECTION).find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = CommentModel.create(
        post_id=post_id,
        user_id=current_user["id"],
        user_name=current_user["name"],
        content=comment_data.content,
        is_anonymous=comment_data.is_anonymous
    )
    
    await db.get_collection(POSTS_COLLECTION).update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": comment}}
    )
    
    return {"success": True, "message": "কমেন্ট যোগ হয়েছে"}

@router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(
    post_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user)
):
    post = await db.get_collection(POSTS_COLLECTION).find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = post.get("comments", [])
    comment = next((c for c in comments if c.get("id") == comment_id), None)
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment["user_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="You can only delete your own comments")
    
    await db.get_collection(POSTS_COLLECTION).update_one(
        {"_id": ObjectId(post_id)},
        {"$pull": {"comments": {"id": comment_id}}}
    )
    
    return {"success": True, "message": "কমেন্ট ডিলিট হয়েছে"}
