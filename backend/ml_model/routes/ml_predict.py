from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth.dependencies.auth import get_current_user
from core.database import db
from datetime import datetime
from ml_model.services.model_service import model_service
from ml_model.services.llm_service import llm_service
import numpy as np

router = APIRouter(prefix="/ml-assessment", tags=["ML Assessment"])

class AssessmentRequest(BaseModel):
    family_history: str
    care_options: str
    self_employed: str
    gender: str

class FullAssessmentRequest(BaseModel):
    family_history: str
    care_options: str
    self_employed: str
    gender: str
    age: str
    marital_status: str
    education: str
    employment_status: str
    income_level: str
    stress_level: str
    sleep_quality: str
    physical_activity: str
    social_support: str
    substance_use: str
    medical_history: str
    mental_health_treatment: str
    family_support: str

class AssessmentResponse(BaseModel):
    success: bool
    risk_score: Optional[float]
    needs_treatment: Optional[bool]
    recommendation: str
    recommendation_bn: str
    confidence: float
    model_used: str = "mental_v1.pkl"
    recommendation_source: str = "fallback"

@router.post("/predict", response_model=AssessmentResponse)
async def predict_assessment(
    request: AssessmentRequest,
    current_user: dict = Depends(get_current_user)
):
    data = {
        'family_history': request.family_history,
        'care_options': request.care_options,
        'self_employed': request.self_employed,
        'gender': request.gender
    }
    
    result = model_service.predict(data)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result.get('error', 'Prediction failed'))
    
    llm_response = await llm_service.get_recommendation(
        risk_score=result['risk_score'],
        needs_treatment=result['needs_treatment'],
        user_data=data
    )
    
    if llm_response.get('source') == 'groq':
        recommendation = llm_response.get('recommendation_en', '')
        recommendation_bn = llm_response.get('recommendation_bn', '')
        rec_source = 'groq'
    elif llm_response.get('source') == 'huggingface':
        recommendation = llm_response.get('recommendation_en', '')
        recommendation_bn = llm_response.get('recommendation_bn', '')
        rec_source = 'huggingface'
    else:
        recommendation = llm_response.get('recommendation_en', '')
        recommendation_bn = llm_response.get('recommendation_bn', '')
        rec_source = 'fallback'
    
    assessment_doc = {
        "user_id": current_user["id"],
        "risk_score": result['risk_score'],
        "needs_treatment": result['needs_treatment'],
        "model_used": "mental_v1.pkl",
        "answers": data,
        "recommendation_source": rec_source,
        "created_at": datetime.utcnow()
    }
    
    await db.get_collection("quick_assessments").insert_one(assessment_doc)
    
    return {
        "success": True,
        "risk_score": result['risk_score'],
        "needs_treatment": result['needs_treatment'],
        "recommendation": recommendation,
        "recommendation_bn": recommendation_bn,
        "confidence": result['confidence'],
        "model_used": "mental_v1.pkl",
        "recommendation_source": rec_source
    }

@router.post("/predict-full", response_model=AssessmentResponse)
async def predict_full_assessment(
    request: FullAssessmentRequest,
    current_user: dict = Depends(get_current_user)
):
    # Convert all 17 features to numeric
    data = request.dict()
    
    # Map string values to numeric for all 17 features
    mapping = {
        'Yes': 1, 'No': 0, 'Not sure': 2,
        'Male': 0, 'Female': 1,
        '18-25': 0, '26-35': 1, '36-45': 2, '46+': 3,
        'Single': 0, 'Married': 1, 'Widowed': 2, 'Divorced': 3,
        'Primary': 0, 'Secondary': 1, 'Higher Secondary': 2, 'Graduate': 3, 'Post Graduate': 4,
        'Employed': 0, 'Business': 1, 'Unemployed': 2, 'Student': 3, 'Housewife': 4,
        '<25000': 0, '25000-50000': 1, '50000-100000': 2, '>100000': 3,
        'Low': 0, 'Medium': 1, 'High': 2, 'Very High': 3,
        'Good': 0, 'Average': 1, 'Poor': 2, 'Very Poor': 3,
        'Yes': 1, 'Sometimes': 1, 'No': 0,
        'Yes': 1, 'Partial': 1, 'No': 0,
        'Never': 0, 'Rarely': 1, 'Moderate': 2, 'Heavy': 3,
        'No': 0, 'Yes (Chronic)': 1, 'Yes (Temporary)': 1,
        'Yes': 1, 'No': 0,
        'Yes': 1, 'Partial': 1, 'No': 0
    }
    
    # Convert all features to numeric using the mapping
    numeric_data = {}
    for key, value in data.items():
        if isinstance(value, str):
            numeric_data[key] = mapping.get(value, 0)
        else:
            numeric_data[key] = value
    
    # Get prediction from model
    result = model_service.predict_full(numeric_data)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result.get('error', 'Prediction failed'))
    
    llm_response = await llm_service.get_recommendation(
        risk_score=result['risk_score'],
        needs_treatment=result['needs_treatment'],
        user_data=data
    )
    
    if llm_response.get('source') == 'groq':
        recommendation = llm_response.get('recommendation_en', '')
        recommendation_bn = llm_response.get('recommendation_bn', '')
        rec_source = 'groq'
    else:
        recommendation = llm_response.get('recommendation_en', '')
        recommendation_bn = llm_response.get('recommendation_bn', '')
        rec_source = 'fallback'
    
    assessment_doc = {
        "user_id": current_user["id"],
        "risk_score": result['risk_score'],
        "needs_treatment": result['needs_treatment'],
        "model_used": "mental_v1.pkl",
        "answers": data,
        "recommendation_source": rec_source,
        "created_at": datetime.utcnow()
    }
    
    await db.get_collection("quick_assessments").insert_one(assessment_doc)
    
    return {
        "success": True,
        "risk_score": result['risk_score'],
        "needs_treatment": result['needs_treatment'],
        "recommendation": recommendation,
        "recommendation_bn": recommendation_bn,
        "confidence": result['confidence'],
        "model_used": "mental_v1.pkl",
        "recommendation_source": rec_source
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
            "recommendation_source": a.get("recommendation_source", "fallback"),
            "created_at": a.get("created_at").isoformat() if a.get("created_at") else None
        })
    
    return {"success": True, "history": result}

@router.get("/model-info")
async def get_model_info(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "model_loaded": model_service.is_loaded,
        "model_path": str(model_service.model_path),
        "llm_available": model_service is not None
    }
