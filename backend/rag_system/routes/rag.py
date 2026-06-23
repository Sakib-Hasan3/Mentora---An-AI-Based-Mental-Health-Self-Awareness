from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth.dependencies.auth import get_current_user
from core.database import db
from datetime import datetime
from rag_system.services.rag_service import rag_service
from rag_system.services.vector_store import vector_store

router = APIRouter(prefix="/rag", tags=["RAG System"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    response: str
    context_used: bool
    sources: list
    session_id: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def rag_chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    result = await rag_service.get_response(request.message)
    
    chat_doc = {
        "user_id": current_user["id"],
        "message": request.message,
        "response": result['response'],
        "context_used": result.get('context_used', False),
        "session_id": request.session_id or str(datetime.utcnow().timestamp()),
        "created_at": datetime.utcnow()
    }
    
    await db.get_collection("rag_chat_history").insert_one(chat_doc)
    
    return {
        "success": True,
        "response": result['response'],
        "context_used": result.get('context_used', False),
        "sources": result.get('sources', []),
        "session_id": chat_doc["session_id"]
    }

@router.get("/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["id"]}
    if session_id:
        query["session_id"] = session_id
    
    history = await db.get_collection("rag_chat_history").find(query).sort("created_at", -1).to_list(length=50)
    
    return {
        "success": True,
        "history": [
            {
                "id": str(h["_id"]),
                "message": h["message"],
                "response": h["response"],
                "context_used": h.get("context_used", False),
                "created_at": h["created_at"].isoformat() if h.get("created_at") else None
            }
            for h in history
        ]
    }

@router.get("/initialize")
async def initialize_knowledge_base(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from pathlib import Path
    knowledge_files = [
        "mental_health_faq.txt",
        "depression_tips.txt",
        "anxiety_tips.txt"
    ]
    
    all_docs = []
    for filename in knowledge_files:
        filepath = Path(__file__).parent.parent.parent / "data" / "knowledge" / filename
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                paragraphs = content.split('\n\n')
                for p in paragraphs:
                    if p.strip():
                        all_docs.append(p.strip())
    
    if all_docs:
        vector_store.add_documents(
            documents=all_docs,
            metadatas=[{"source": "knowledge_base"} for _ in all_docs]
        )
    
    return {"success": True, "message": f"Added {len(all_docs)} documents"}

@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "total_documents": vector_store.collection.count(),
        "collection_name": vector_store.collection.name
    }
