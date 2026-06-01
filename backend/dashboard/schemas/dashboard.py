from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ========== ড্যাশবোর্ড স্ট্যাটস রেসপন্স ==========
class DashboardStatsResponse(BaseModel):
    mental_health_score: int = Field(..., description="মানসিক সুস্থতা স্কোর")
    total_assessments: int = Field(..., description="মোট অ্যাসেসমেন্ট সংখ্যা")
    stress_level: int = Field(..., description="স্ট্রেস লেভেল (০-১০০)")
    meditation_sessions: int = Field(..., description="মেডিটেশন সেশন সংখ্যা")
    last_updated: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "mental_health_score": 78,
                "total_assessments": 12,
                "stress_level": 32,
                "meditation_sessions": 8
            }
        }

# ========== অ্যাসেসমেন্ট রিকোয়েস্ট ==========
class AssessmentRequest(BaseModel):
    answers: List[Dict[str, Any]] = Field(..., description="প্রশ্নের উত্তর")
    
    class Config:
        json_schema_extra = {
            "example": {
                "answers": [
                    {"question": "গত সপ্তাহে কতবার মন খারাপ হয়েছে?", "answer": "১-২ বার"},
                    {"question": "ঘুম কেমন হয়েছে?", "answer": "মাঝারি"}
                ]
            }
        }

# ========== অ্যাসেসমেন্ট রেসপন্স ==========
class AssessmentResponse(BaseModel):
    success: bool
    message: str
    assessment_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "অ্যাসেসমেন্ট সফলভাবে সম্পন্ন হয়েছে",
                "assessment_id": "507f1f77bcf86cd799439011"
            }
        }

# ========== অ্যাসেসমেন্ট রেজাল্ট রেসপন্স ==========
class AssessmentResultResponse(BaseModel):
    success: bool
    score: int
    level: str
    advice: str
    details: Optional[Dict] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "score": 75,
                "level": "মাঝারি ঝুঁকি",
                "advice": "নিয়মিত মেডিটেশন ও ব্যায়াম করুন",
                "details": {
                    "emotional": 70,
                    "social": 80,
                    "physical": 75
                }
            }
        }

# ========== ইউজার প্রোগ্রেস রেসপন্স ==========
class UserProgressResponse(BaseModel):
    success: bool
    total_assessments: int
    average_score: float
    best_score: int
    streak_days: int
    last_assessment_date: Optional[datetime]
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "total_assessments": 12,
                "average_score": 72.5,
                "best_score": 85,
                "streak_days": 5,
                "last_assessment_date": "2024-06-01T10:30:00Z"
            }
        }

# ========== চার্ট ডাটা রেসপন্স ==========
class ChartDataResponse(BaseModel):
    success: bool
    type: str
    labels: List[str]
    data: List[int]
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "type": "weekly",
                "labels": ["সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি", "রবি"],
                "data": [65, 72, 68, 75, 80, 78, 82]
            }
        }

# ========== সাম্প্রতিক কার্যকলাপ রেসপন্স ==========
class ActivityItem(BaseModel):
    id: str
    type: str
    title: str
    description: str
    date: datetime
    icon: str
    metadata: Optional[Dict] = None

class ActivityResponse(BaseModel):
    success: bool
    activities: List[ActivityItem]
    total: int


class ErrorResponse(BaseModel):
    detail: str