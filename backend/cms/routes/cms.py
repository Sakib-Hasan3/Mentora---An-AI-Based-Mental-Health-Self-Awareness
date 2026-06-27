from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from auth.dependencies.auth import get_current_user
from core.database import db
from cms.models.cms import ContentModel
from pydantic import BaseModel

router = APIRouter(prefix="/cms", tags=["CMS"])

CONTENT_COLLECTION = "cms_content"

class ContentCreate(BaseModel):
    type: str
    title: str
    title_bn: Optional[str] = None
    content: str
    content_bn: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    source: Optional[str] = None
    is_published: bool = True
    featured: bool = False

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    title_bn: Optional[str] = None
    content: Optional[str] = None
    content_bn: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_published: Optional[bool] = None
    featured: Optional[bool] = None

@router.post("/content")
async def create_content(
    data: ContentCreate,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    content_doc = ContentModel.create({
        **data.dict(),
        "created_by": current_user["id"]
    })
    
    result = await db.get_collection(CONTENT_COLLECTION).insert_one(content_doc)
    
    return {
        "success": True,
        "message": "Content created successfully",
        "id": str(result.inserted_id)
    }

@router.get("/content")
async def get_content(
    type: Optional[str] = None,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if not current_user.get("is_admin"):
        query["is_published"] = True
    
    content = await db.get_collection(CONTENT_COLLECTION).find(query).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return {
        "success": True,
        "content": [ContentModel.from_db(c) for c in content],
        "total": len(content)
    }

@router.get("/content/{content_id}")
async def get_single_content(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    content = await db.get_collection(CONTENT_COLLECTION).find_one({"_id": ObjectId(content_id)})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    await db.get_collection(CONTENT_COLLECTION).update_one(
        {"_id": ObjectId(content_id)},
        {"$inc": {"views": 1}}
    )
    
    return {"success": True, "content": ContentModel.from_db(content)}

@router.put("/content/{content_id}")
async def update_content(
    content_id: str,
    data: ContentUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.get_collection(CONTENT_COLLECTION).update_one(
        {"_id": ObjectId(content_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"success": True, "message": "Content updated"}

@router.delete("/content/{content_id}")
async def delete_content(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.get_collection(CONTENT_COLLECTION).delete_one({"_id": ObjectId(content_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"success": True, "message": "Content deleted"}

@router.get("/content/categories")
async def get_categories(current_user: dict = Depends(get_current_user)):
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    categories = await db.get_collection(CONTENT_COLLECTION).aggregate(pipeline).to_list(length=50)
    
    return {
        "success": True,
        "categories": [{"name": c["_id"], "count": c["count"]} for c in categories if c["_id"]]
    }

# ─── Admin User Management Endpoints ────────────────────────────────────────

USER_COLLECTION = "users"

@router.get("/users")
async def get_all_users(
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.get_collection(USER_COLLECTION).find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    formatted_users = []
    for u in users:
        formatted_users.append({
            "id": str(u["_id"]),
            "name": u.get("name", "N/A"),
            "email": u.get("email", "N/A"),
            "phone": u.get("phone"),
            "user_type": u.get("user_type", "free"),
            "subscription": u.get("subscription"),
            "is_admin": u.get("is_admin", False),
            "is_active": u.get("is_active", True),
            "created_at": u.get("created_at").isoformat() if u.get("created_at") else None
        })
        
    return {"success": True, "users": formatted_users}

@router.put("/users/{user_id}/upgrade")
async def upgrade_user_admin(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.get_collection(USER_COLLECTION).find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Toggle or force upgrade
    new_type = "free" if user.get("user_type") == "paid" else "paid"
    new_sub = None if new_type == "free" else "premium"
    
    await db.get_collection(USER_COLLECTION).update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"user_type": new_type, "subscription": new_sub}}
    )
    
    return {
        "success": True, 
        "message": f"User upgraded/downgraded to {new_type}", 
        "user_type": new_type,
        "subscription": new_sub
    }

@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.get_collection(USER_COLLECTION).find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_status = not user.get("is_active", True)
    
    await db.get_collection(USER_COLLECTION).update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": new_status}}
    )
    
    return {"success": True, "message": f"User status updated", "is_active": new_status}

@router.put("/users/{user_id}/toggle-admin")
async def toggle_user_admin(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if str(current_user["id"]) == user_id:
        raise HTTPException(status_code=400, detail="You cannot modify your own admin status")
        
    user = await db.get_collection(USER_COLLECTION).find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_admin = not user.get("is_admin", False)
    
    await db.get_collection(USER_COLLECTION).update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_admin": new_admin}}
    )
    
    return {"success": True, "message": f"User admin status updated", "is_admin": new_admin}

