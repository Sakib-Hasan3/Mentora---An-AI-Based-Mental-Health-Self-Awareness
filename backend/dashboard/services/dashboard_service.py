from datetime import datetime, timedelta
from typing import Dict, Any, List
import random

from core.database import db
from core.security import decode_token
from dashboard.models.dashboard import DashboardModel, AssessmentModel, UserStatsModel
from dashboard.schemas.dashboard import AssessmentRequest

# কালেকশনের নাম
USER_COLLECTION = "users"
ASSESSMENT_COLLECTION = "assessments"
USER_STATS_COLLECTION = "user_stats"

class DashboardService:
    
    @staticmethod
    async def get_dashboard_stats(user_id: str) -> Dict[str, Any]:
        """ইউজারের ড্যাশবোর্ড স্ট্যাটস পাওয়া"""
        
        # ইউজারের স্ট্যাটস খুঁজুন
        stats = await db.get_collection(USER_STATS_COLLECTION).find_one({"user_id": user_id})
        
        if not stats:
            # ডিফল্ট স্ট্যাটস তৈরি করুন
            stats = DashboardModel.get_default_stats(user_id)
            await db.get_collection(USER_STATS_COLLECTION).insert_one(stats)
        
        # সাম্প্রতিক অ্যাসেসমেন্ট থেকে স্কোর আপডেট
        recent_assessments = await db.get_collection(ASSESSMENT_COLLECTION).find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(5).to_list(length=5)
        
        if recent_assessments:
            avg_score = sum(a.get("score", 0) for a in recent_assessments) / len(recent_assessments)
            stats["mental_health_score"] = int(avg_score)
        
        return {
            "mental_health_score": stats.get("mental_health_score", 75),
            "total_assessments": stats.get("total_assessments", 0),
            "stress_level": stats.get("stress_level", 35),
            "meditation_sessions": stats.get("meditation_sessions", 0),
            "last_updated": stats.get("last_updated")
        }
    
    @staticmethod
    async def submit_assessment(user_id: str, assessment_data: AssessmentRequest) -> Dict[str, Any]:
        """অ্যাসেসমেন্ট সাবমিট করা"""
        
        # স্কোর ক্যালকুলেট করুন
        total_score = 0
        for answer in assessment_data.answers:
            # উত্তর অনুযায়ী স্কোর নির্ধারণ
            answer_text = answer.get("answer", "")
            if "খুব ভালো" in answer_text or "কখনো না" in answer_text:
                total_score += 20
            elif "ভালো" in answer_text or "১-২ বার" in answer_text:
                total_score += 15
            elif "মাঝারি" in answer_text or "৩-৪ বার" in answer_text:
                total_score += 10
            elif "খারাপ" in answer_text or "প্রতিদিন" in answer_text:
                total_score += 5
            else:
                total_score += 10
        
        # স্কোর নরমালাইজ করুন (০-১০০)
        max_possible = len(assessment_data.answers) * 20
        final_score = int((total_score / max_possible) * 100) if max_possible > 0 else 50
        
        # লেভেল নির্ধারণ
        if final_score >= 70:
            level = "কম ঝুঁকি"
            advice = "আপনি ভালো আছেন! সুস্থ থাকার জন্য নিয়মিত ব্যায়াম ও মেডিটেশন করুন।"
        elif final_score >= 40:
            level = "মাঝারি ঝুঁকি"
            advice = "আমরা বুঝি আপনি কঠিন সময় পার করছেন। দয়া করে কারো সাথে কথা বলুন। আমাদের ২৪/৭ হেল্পলাইন আছে: ১৬২৬৩"
        else:
            level = "উচ্চ ঝুঁকি"
            advice = "আপনার মানসিক স্বাস্থ্যের জন্য দয়া করে একজন বিশেষজ্ঞের সাথে কথা বলুন। আমরা আছি আপনার পাশে।"
        
        # অ্যাসেসমেন্ট সেভ করুন
        assessment_doc = AssessmentModel.create(
            user_id=user_id,
            answers=assessment_data.answers,
            score=final_score,
            level=level
        )
        
        result = await db.get_collection(ASSESSMENT_COLLECTION).insert_one(assessment_doc)
        
        # ইউজার স্ট্যাটস আপডেট করুন
        existing_stats = await db.get_collection(USER_STATS_COLLECTION).find_one({"user_id": user_id})
        
        if existing_stats:
            updated_stats = UserStatsModel.update_stats(existing_stats, final_score)
            await db.get_collection(USER_STATS_COLLECTION).update_one(
                {"user_id": user_id},
                {"$set": updated_stats}
            )
        else:
            new_stats = UserStatsModel.create(user_id)
            new_stats["total_assessments"] = 1
            new_stats["average_score"] = final_score
            new_stats["best_score"] = final_score
            new_stats["last_assessment_date"] = datetime.utcnow()
            await db.get_collection(USER_STATS_COLLECTION).insert_one(new_stats)
        
        return {
            "success": True,
            "message": "অ্যাসেসমেন্ট সফলভাবে সম্পন্ন হয়েছে",
            "assessment_id": str(result.inserted_id),
            "score": final_score,
            "level": level,
            "advice": advice
        }
    
    @staticmethod
    async def get_assessment_result(assessment_id: str, user_id: str) -> Dict[str, Any]:
        """নির্দিষ্ট অ্যাসেসমেন্টের রেজাল্ট পাওয়া"""
        
        from bson import ObjectId
        
        assessment = await db.get_collection(ASSESSMENT_COLLECTION).find_one({
            "_id": ObjectId(assessment_id),
            "user_id": user_id
        })
        
        if not assessment:
            return {
                "success": False,
                "message": "অ্যাসেসমেন্ট পাওয়া যায়নি"
            }
        
        return {
            "success": True,
            "score": assessment.get("score", 0),
            "level": assessment.get("level", ""),
            "advice": DashboardService._get_advice(assessment.get("level", "")),
            "details": {
                "answers": assessment.get("answers", []),
                "created_at": assessment.get("created_at")
            }
        }
    
    @staticmethod
    async def get_user_progress(user_id: str) -> Dict[str, Any]:
        """ইউজারের প্রোগ্রেস ডাটা পাওয়া"""
        
        stats = await db.get_collection(USER_STATS_COLLECTION).find_one({"user_id": user_id})
        
        if not stats:
            return {
                "success": True,
                "total_assessments": 0,
                "average_score": 0,
                "best_score": 0,
                "streak_days": 0,
                "last_assessment_date": None
            }
        
        return {
            "success": True,
            "total_assessments": stats.get("total_assessments", 0),
            "average_score": stats.get("average_score", 0),
            "best_score": stats.get("best_score", 0),
            "streak_days": stats.get("streak_days", 0),
            "last_assessment_date": stats.get("last_assessment_date")
        }
    
    @staticmethod
    async def get_chart_data(user_id: str, chart_type: str = "weekly") -> Dict[str, Any]:
        """চার্ট ডাটা পাওয়া (weekly/monthly/yearly)"""
        
        # ইউজারের সব অ্যাসেসমেন্ট
        assessments = await db.get_collection(ASSESSMENT_COLLECTION).find(
            {"user_id": user_id}
        ).sort("created_at", 1).to_list(length=100)
        
        if chart_type == "weekly":
            # গত ৭ দিনের ডাটা
            labels = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি', 'রবি']
            data = [random.randint(65, 85) for _ in range(7)]
            
            # যদি অ্যাসেসমেন্ট থাকে, সেগুলো থেকে ডাটা নিন
            if assessments:
                data = []
                for i in range(7):
                    day_assessments = [a for a in assessments if a.get("created_at") and 
                                      a["created_at"].day == (datetime.utcnow() - timedelta(days=6-i)).day]
                    if day_assessments:
                        data.append(sum(a.get("score", 0) for a in day_assessments) // len(day_assessments))
                    else:
                        data.append(70)
        
        elif chart_type == "monthly":
            labels = ['১ম সপ্তাহ', '২য় সপ্তাহ', '৩য় সপ্তাহ', '৪র্থ সপ্তাহ']
            data = [random.randint(70, 90) for _ in range(4)]
            
            if assessments:
                data = []
                for week in range(4):
                    week_assessments = [a for a in assessments if a.get("created_at") and 
                                        a["created_at"].isocalendar()[1] == (datetime.utcnow().isocalendar()[1] - (3-week))]
                    if week_assessments:
                        data.append(sum(a.get("score", 0) for a in week_assessments) // len(week_assessments))
                    else:
                        data.append(75)
        
        else:  # yearly
            labels = ['শীত', 'বসন্ত', 'গ্রীষ্ম', 'বর্ষা']
            data = [random.randint(65, 90) for _ in range(4)]
        
        return {
            "success": True,
            "type": chart_type,
            "labels": labels,
            "data": data
        }
    
    @staticmethod
    async def get_recent_activities(user_id: str, limit: int = 10) -> Dict[str, Any]:
        """সাম্প্রতিক কার্যকলাপ পাওয়া"""
        
        # সাম্প্রতিক অ্যাসেসমেন্ট
        recent_assessments = await db.get_collection(ASSESSMENT_COLLECTION).find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit).to_list(length=limit)
        
        activities = []
        
        for assessment in recent_assessments:
            activities.append({
                "id": str(assessment["_id"]),
                "type": "assessment",
                "title": "মানসিক স্বাস্থ্য পরীক্ষা",
                "description": f"স্কোর: {assessment.get('score', 0)}% - {assessment.get('level', '')}",
                "date": assessment.get("created_at", datetime.utcnow()),
                "icon": "📝",
                "metadata": {"score": assessment.get("score", 0)}
            })
        
        # ডিফল্ট কার্যকলাপ (যদি কিছু না থাকে)
        if not activities:
            activities = [
                {
                    "id": "1",
                    "type": "welcome",
                    "title": "স্বাগতম!",
                    "description": "আপনার প্রথম অ্যাসেসমেন্ট দিন",
                    "date": datetime.utcnow(),
                    "icon": "🎉"
                }
            ]
        
        return {
            "success": True,
            "activities": activities[:limit],
            "total": len(activities)
        }
    
    @staticmethod
    def _get_advice(level: str) -> str:
        """লেভেল অনুযায়ী পরামর্শ"""
        advice_map = {
            "কম ঝুঁকি": "আপনি ভালো আছেন! সুস্থ থাকার জন্য নিয়মিত ব্যায়াম ও মেডিটেশন করুন।",
            "মাঝারি ঝুঁকি": "আমরা বুঝি আপনি কঠিন সময় পার করছেন। দয়া করে কারো সাথে কথা বলুন।",
            "উচ্চ ঝুঁকি": "আপনার মানসিক স্বাস্থ্যের জন্য দয়া করে একজন বিশেষজ্ঞের সাথে কথা বলুন।"
        }
        return advice_map.get(level, "আপনার যত্ন নিন, আমরা আছি আপনার পাশে।")