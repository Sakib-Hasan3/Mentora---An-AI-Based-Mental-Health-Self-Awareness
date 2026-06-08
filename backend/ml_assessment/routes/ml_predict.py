from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth.dependencies.auth import get_current_user
from core.database import db
from datetime import datetime
import aiohttp
import asyncio

router = APIRouter(prefix="/ml-assessment", tags=["ML Assessment"])

class AssessmentRequest(BaseModel):
    family_history: str  # Yes/No
    care_options: str    # Yes/No/Not sure
    self_employed: str   # Yes/No
    gender: str          # Male/Female

class AssessmentResponse(BaseModel):
    success: bool
    risk_score: float
    needs_treatment: bool
    recommendation: str
    recommendation_bn: str
    confidence: float

# HuggingFace Free Inference API (Optional - for LangChain)
# No API key needed for public models
HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"

async def get_ai_recommendation(risk_score: float, needs_treatment: bool) -> tuple:
    """Get AI-powered recommendation using free HuggingFace API"""
    
    if needs_treatment:
        prompt = f"A person with mental health risk score {risk_score:.2f} needs treatment. Give a brief empathetic recommendation in 1 sentence."
    else:
        prompt = f"A person with mental health risk score {risk_score:.2f} is doing well. Give a brief positive wellness tip in 1 sentence."
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                HF_API_URL,
                json={"inputs": prompt, "parameters": {"max_length": 100}},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    ai_text = data[0].get("generated_text", "") if isinstance(data, list) else ""
                    if ai_text:
                        return ai_text, ai_text
    except Exception as e:
        print(f"AI API error: {e}")
    
    # Fallback recommendations
    return get_fallback_recommendation(risk_score, needs_treatment)

def get_fallback_recommendation(risk_score: float, needs_treatment: bool) -> tuple:
    if needs_treatment:
        recommendations = [
            ("Please consider speaking with a mental health professional. You're not alone. 💚", "একজন মানসিক স্বাস্থ্য বিশেষজ্ঞের সাথে কথা বলার কথা বিবেচনা করুন। আপনি একা নন। 💚"),
            ("It might be helpful to talk to someone about how you're feeling. Helpline: 16263", "আপনার অনুভূতি সম্পর্কে কারো সাথে কথা বলা সহায়ক হতে পারে। হেল্পলাইন: ১৬২৬৩"),
            ("Taking the first step is brave. Consider scheduling a consultation.", "প্রথম পদক্ষেপ নেওয়া সাহসের কাজ। একটি কাউন্সেলিং সেশনের সময় নির্ধারণ করুন।")
        ]
    else:
        recommendations = [
            ("You're doing great! Keep practicing self-care and mindfulness. 🧘", "আপনি ভালো করছেন! স্ব-যত্ন এবং মাইন্ডফুলনেস চর্চা চালিয়ে যান। 🧘"),
            ("Maintain your mental wellness with regular exercise and good sleep. 😴", "নিয়মিত ব্যায়াম এবং ভালো ঘুমের মাধ্যমে আপনার মানসিক সুস্থতা বজায় রাখুন। 😴"),
            ("Stay connected with loved ones. Social support is important for mental health. 💚", "প্রিয়জনের সাথে সংযুক্ত থাকুন। মানসিক স্বাস্থ্যের জন্য সামাজিক সমর্থন গুরুত্বপূর্ণ। 💚")
        ]
    
    import random
    return random.choice(recommendations)

@router.post("/predict", response_model=AssessmentResponse)
async def predict_assessment(
    request: AssessmentRequest,
    current_user: dict = Depends(get_current_user)
):
    # Calculate risk score based on feature importance
    risk_score = 0.0
    
    # family_history: 60% importance
    if request.family_history == "Yes":
        risk_score += 0.60
    
    # care_options: 29% importance
    if request.care_options == "No":
        risk_score += 0.29
    
    # self_employed: 5.5% importance
    if request.self_employed == "Yes":
        risk_score += 0.055
    
    # Gender: 5.2% importance (Female has slightly higher risk)
    if request.gender == "Female":
        risk_score += 0.052
    
    needs_treatment = risk_score > 0.5
    
    # Get recommendation
    recommendation_en, recommendation_bn = await get_ai_recommendation(risk_score, needs_treatment)
    
    # Save assessment to database
    assessment_doc = {
        "user_id": current_user["id"],
        "type": "quick_assessment",
        "answers": {
            "family_history": request.family_history,
            "care_options": request.care_options,
            "self_employed": request.self_employed,
            "gender": request.gender
        },
        "risk_score": risk_score,
        "needs_treatment": needs_treatment,
        "created_at": datetime.utcnow()
    }
    
    await db.get_collection("quick_assessments").insert_one(assessment_doc)
    
    return {
        "success": True,
        "risk_score": round(risk_score, 2),
        "needs_treatment": needs_treatment,
        "recommendation": recommendation_en,
        "recommendation_bn": recommendation_bn,
        "confidence": 71.55
    }

@router.get("/history")
async def get_assessment_history(current_user: dict = Depends(get_current_user)):
    assessments = await db.get_collection("quick_assessments").find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(10).to_list(length=10)
    
    result = []
    for a in assessments:
        result.append({
            "id": str(a["_id"]),
            "risk_score": a.get("risk_score"),
            "needs_treatment": a.get("needs_treatment"),
            "created_at": a.get("created_at").isoformat() if a.get("created_at") else None
        })
    
    return {"success": True, "history": result}
