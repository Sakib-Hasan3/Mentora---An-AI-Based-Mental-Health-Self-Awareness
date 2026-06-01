from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from bson import ObjectId
import random

class DashboardModel:
    """ড্যাশবোর্ডের ডাটা মডেল"""
    
    @staticmethod
    def get_default_stats(user_id: str) -> Dict[str, Any]:
        """ডিফল্ট স্ট্যাটস ডাটা"""
        return {
            "user_id": user_id,
            "mental_health_score": 75,
            "total_assessments": 0,
            "stress_level": 35,
            "meditation_sessions": 0,
            "last_updated": datetime.utcnow()
        }
    
    @staticmethod
    def get_weekly_scores() -> List[Dict]:
        """সাপ্তাহিক স্কোর ডাটা"""
        days = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি', 'রবি']
        return [
            {"day": day, "score": random.randint(65, 85)}
            for day in days
        ]
    
    @staticmethod
    def get_monthly_scores() -> List[Dict]:
        """মাসিক স্কোর ডাটা"""
        weeks = ['১ম সপ্তাহ', '২য় সপ্তাহ', '৩য় সপ্তাহ', '৪র্থ সপ্তাহ']
        return [
            {"week": week, "score": random.randint(70, 90)}
            for week in weeks
        ]

class AssessmentModel:
    """অ্যাসেসমেন্ট মডেল"""
    
    @staticmethod
    def create(user_id: str, answers: List[Dict], score: int, level: str) -> Dict:
        """নতুন অ্যাসেসমেন্ট তৈরি"""
        return {
            "user_id": user_id,
            "answers": answers,
            "score": score,
            "level": level,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def from_db(assessment: Dict) -> Dict:
        """ডাটাবেস থেকে পাওয়া অ্যাসেসমেন্টকে JSON এ কনভার্ট"""
        return {
            "id": str(assessment["_id"]),
            "user_id": str(assessment["user_id"]) if assessment.get("user_id") else None,
            "answers": assessment.get("answers", []),
            "score": assessment.get("score", 0),
            "level": assessment.get("level", ""),
            "created_at": assessment.get("created_at"),
            "updated_at": assessment.get("updated_at")
        }

class UserStatsModel:
    """ইউজার স্ট্যাটস মডেল"""
    
    @staticmethod
    def create(user_id: str) -> Dict:
        """ইউজারের জন্য নতুন স্ট্যাটস তৈরি"""
        return {
            "user_id": user_id,
            "total_assessments": 0,
            "average_score": 0,
            "best_score": 0,
            "last_assessment_date": None,
            "streak_days": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def update_stats(existing_stats: Dict, new_score: int) -> Dict:
        """স্ট্যাটস আপডেট"""
        total = existing_stats.get("total_assessments", 0) + 1
        avg_score = ((existing_stats.get("average_score", 0) * existing_stats.get("total_assessments", 0)) + new_score) / total
        
        return {
            "total_assessments": total,
            "average_score": round(avg_score, 2),
            "best_score": max(existing_stats.get("best_score", 0), new_score),
            "last_assessment_date": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }