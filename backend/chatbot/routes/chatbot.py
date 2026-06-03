from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from auth.dependencies.auth import get_current_user
from chatbot.services.ollama_service import ollama_service
from core.database import db
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatHistory(BaseModel):
    messages: List[dict]

@router.post("/chat")
async def chat(
    request: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to chatbot and get AI response"""
    
    user_id = current_user["id"]
    
    # Save user message to database
    chat_collection = db.get_collection("chat_sessions")
    
    user_message = {
        "user_id": user_id,
        "session_id": request.session_id or str(ObjectId()),
        "role": "user",
        "content": request.message,
        "created_at": datetime.utcnow()
    }
    
    await chat_collection.insert_one(user_message)
    
    # Get conversation history
    history = await get_conversation_history(user_id, request.session_id)
    
    # Generate AI response
    ai_response = await ollama_service.generate_response(request.message, history)
    
    # Save AI response
    ai_message = {
        "user_id": user_id,
        "session_id": request.session_id or user_message["session_id"],
        "role": "assistant",
        "content": ai_response,
        "created_at": datetime.utcnow()
    }
    
    await chat_collection.insert_one(ai_message)
    
    return {
        "success": True,
        "message": ai_response,
        "session_id": user_message["session_id"]
    }

@router.get("/history/{session_id}")
async def get_chat_history(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get chat history for a session"""
    
    user_id = current_user["id"]
    chat_collection = db.get_collection("chat_sessions")
    
    messages = await chat_collection.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", 1).to_list(length=100)
    
    result = []
    for msg in messages:
        result.append({
            "id": str(msg["_id"]),
            "role": msg["role"],
            "content": msg["content"],
            "created_at": msg["created_at"].isoformat() if msg.get("created_at") else None
        })
    
    return {"success": True, "messages": result, "session_id": session_id}

@router.get("/sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    """Get all chat sessions for user"""
    
    user_id = current_user["id"]
    chat_collection = db.get_collection("chat_sessions")
    
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$session_id",
            "last_message": {"$last": "$content"},
            "last_updated": {"$last": "$created_at"},
            "message_count": {"$sum": 1}
        }},
        {"$sort": {"last_updated": -1}}
    ]
    
    sessions = await chat_collection.aggregate(pipeline).to_list(length=50)
    
    result = []
    for session in sessions:
        result.append({
            "session_id": session["_id"],
            "last_message": session["last_message"][:100],
            "last_updated": session["last_updated"].isoformat() if session.get("last_updated") else None,
            "message_count": session["message_count"]
        })
    
    return {"success": True, "sessions": result}

async def get_conversation_history(user_id: str, session_id: Optional[str]) -> List[dict]:
    if not session_id:
        return []
    
    chat_collection = db.get_collection("chat_sessions")
    messages = await chat_collection.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", -1).limit(10).to_list(length=10)
    
    history = []
    for msg in reversed(messages):
        history.append({"role": msg["role"], "content": msg["content"]})
    
    return history
