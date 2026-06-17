
from datetime import datetime
from typing import List, Dict, Any

class AssessmentModel:
    
    @staticmethod
    def create(user_id: str, answers: List[Dict], score: int, level: str, advice: str) -> Dict:
        return {
            "user_id": user_id,
            "answers": answers,
            "score": score,
            "level": level,
            "advice": advice,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def from_db(assessment: Dict) -> Dict:
        return {
            "id": str(assessment["_id"]),
            "user_id": assessment.get("user_id"),
            "score": assessment.get("score", 0),
            "level": assessment.get("level", ""),
            "advice": assessment.get("advice", ""),
            "date": assessment.get("created_at", datetime.utcnow()).strftime("%Y-%m-%d %H:%M"),
            "answers": assessment.get("answers", [])
        }

class AssessmentStatsModel:
    
    @staticmethod
    def calculate_stats(assessments: List[Dict]) -> Dict:
        if not assessments:
            return {
                "total": 0,
                "average_score": 0,
                "best_score": 0,
                "worst_score": 0,
                "trend": "stable",
                "last_assessment": None,
                "improvement": 0,
                "levels": {
                    "normal": 0,
                    "mild": 0,
                    "moderate": 0,
                    "severe": 0
                }
            }
        
        scores = [a.get("score", 0) for a in assessments]
        avg_score = sum(scores) // len(scores)
        
        level_counts = {
            "normal": 0,
            "mild": 0,
            "moderate": 0,
            "severe": 0
        }
        
        for a in assessments:
            level = a.get("level", "normal").lower()
            if level in level_counts:
                level_counts[level] += 1
        
        trend = "improving" if len(scores) >= 2 and scores[-1] > scores[-2] else "stable"
        
        return {
            "total": len(assessments),
            "average_score": avg_score,
            "best_score": max(scores),
            "worst_score": min(scores),
            "trend": trend,
            "last_assessment": assessments[0].get("created_at") if assessments else None,
            "improvement": scores[-1] - scores[0] if len(scores) >= 2 else 0,
            "levels": level_counts
        }
