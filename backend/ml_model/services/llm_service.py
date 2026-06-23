import aiohttp
import os
from groq import Groq
from core.config import settings
import random

class LLMService:
    def __init__(self):
        groq_api_key = settings.GROQ_API_KEY
        
        if groq_api_key:
            self.groq_client = Groq(api_key=groq_api_key)
            self.groq_available = True
            print("✅ Groq client initialized")
        else:
            self.groq_client = None
            self.groq_available = False
            print("⚠️ GROQ_API_KEY not found. Groq disabled.")
        
        self.hf_api_key = settings.HF_API_KEY
        self.hf_api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"
        self.hf_headers = {"Authorization": f"Bearer {self.hf_api_key}"} if self.hf_api_key else {}
        
        if self.hf_api_key:
            print("✅ HuggingFace API configured")
        else:
            print("⚠️ HF_API_KEY not found. HuggingFace disabled.")
        
        print("✅ LLM Service initialized")
    
    async def get_recommendation(self, risk_score: float, needs_treatment: bool, user_data: dict) -> dict:
        """Get AI-powered personalized recommendation"""
        
        prompt = self._create_prompt(risk_score, needs_treatment, user_data)
        
        if self.groq_available:
            result = await self._call_groq(prompt)
            if result:
                return result
        
        if self.hf_api_key:
            result = await self._call_huggingface(prompt)
            if result:
                return result
        
        return self._get_fallback_recommendation(risk_score, needs_treatment)
    
    async def _call_groq(self, prompt: str) -> dict:
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system", 
                        "content": """তুমি 'মেন্টাল সাথী' - একজন বন্ধুত্বপূর্ণ মানসিক স্বাস্থ্য সহায়ক। 
তোমার কাজ:
1. সহানুভূতিশীল এবং উৎসাহদায়ক হওয়া
2. বাংলা ভাষায় উত্তর দেওয়া
3. সংক্ষিপ্ত (৩-৪ বাক্য) এবং কার্যকর পরামর্শ দেওয়া
4. প্রয়োজনে হেল্পলাইন ১৬২৬৩ উল্লেখ করা

উত্তর হবে ৩-৪ বাক্যের মধ্যে। খুব সংক্ষিপ্ত ও স্পষ্ট উত্তর দিন।"""
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150,  # 200 থেকে কমিয়ে 150 করেছি (খরচ কমানোর জন্য)
                top_p=0.9,
            )
            
            response_text = completion.choices[0].message.content.strip()
            
            # যদি উত্তর খুব ছোট হয়, তাহলে সম্পূর্ণ করুন
            if len(response_text) < 50:
                response_text = self._complete_response(response_text, needs_treatment)
            
            return {
                "recommendation_en": response_text,
                "recommendation_bn": response_text,
                "source": "groq",
                "confidence": 0.92
            }
            
        except Exception as e:
            print(f"❌ Groq API error: {e}")
            return None
    
    def _complete_response(self, text: str, needs_treatment: bool) -> str:
        """অসম্পূর্ণ উত্তর সম্পূর্ণ করা"""
        if needs_treatment:
            completions = [
                "আপনি একা নন। একজন মানসিক স্বাস্থ্য বিশেষজ্ঞের সাথে কথা বলুন। 💚 হেল্পলাইন: ১৬২৬৩",
                "আপনার অনুভূতিগুলো গুরুত্বপূর্ণ। কারো সাথে কথা বলা সাহায্য করতে পারে। 💪",
                "প্রথম পদক্ষেপ নেওয়া সাহসের কাজ। আজই একজন কাউন্সেলরের সাথে যোগাযোগ করুন। 📞"
            ]
        else:
            completions = [
                "আপনি ভালো করছেন! স্ব-যত্ন এবং মাইন্ডফুলনেস চর্চা চালিয়ে যান। 🧘",
                "নিয়মিত ব্যায়াম এবং ভালো ঘুম আপনার মানসিক সুস্থতা বজায় রাখবে। 😴",
                "প্রিয়জনের সাথে সংযুক্ত থাকুন। সামাজিক সমর্থন গুরুত্বপূর্ণ। 💚"
            ]
        return text + " " + random.choice(completions)
    
    async def _call_huggingface(self, prompt: str) -> dict:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.hf_api_url,
                    headers=self.hf_headers,
                    json={
                        "inputs": prompt,
                        "parameters": {
                            "max_new_tokens": 150,
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "return_full_text": False
                        }
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data and isinstance(data, list):
                            response_text = data[0].get('generated_text', '').strip()
                            if len(response_text) < 50:
                                response_text = self._complete_response(response_text, True)
                            return {
                                "recommendation_en": response_text,
                                "recommendation_bn": response_text,
                                "source": "huggingface",
                                "confidence": 0.85
                            }
        except Exception as e:
            print(f"❌ HuggingFace API error: {e}")
            return None
    
    def _create_prompt(self, risk_score: float, needs_treatment: bool, user_data: dict) -> str:
        status = "উচ্চ ঝুঁকি" if needs_treatment else "কম ঝুঁকি"
        
        prompt = f"""ব্যবহারকারীর মানসিক স্বাস্থ্য বিশ্লেষণ:
- ঝুঁকি স্কোর: {risk_score:.2f} (০-১ স্কেলে)
- অবস্থা: {status}
- পারিবারিক ইতিহাস: {user_data.get('family_history', 'উল্লেখ নেই')}
- সেবার সুযোগ: {user_data.get('care_options', 'উল্লেখ নেই')}
- স্ব-নিয়োজিত: {user_data.get('self_employed', 'উল্লেখ নেই')}
- লিঙ্গ: {user_data.get('gender', 'উল্লেখ নেই')}

উপরের তথ্যের ভিত্তিতে ব্যবহারকারীকে একটি ব্যক্তিগতকৃত, সহানুভূতিশীল পরামর্শ দিন (৩-৪ বাক্যে)।"""
        
        return prompt
    
    def _get_fallback_recommendation(self, risk_score: float, needs_treatment: bool) -> dict:
        if needs_treatment:
            recommendations_bn = [
                "আপনি একা নন। একজন মানসিক স্বাস্থ্য বিশেষজ্ঞের সাথে কথা বলুন। 💚 হেল্পলাইন: ১৬২৬৩",
                "আপনার অনুভূতিগুলো গুরুত্বপূর্ণ। কারো সাথে কথা বলা সাহায্য করতে পারে। 💪",
                "প্রথম পদক্ষেপ নেওয়া সাহসের কাজ। আজই একজন কাউন্সেলরের সাথে যোগাযোগ করুন। 📞"
            ]
        else:
            recommendations_bn = [
                "আপনি ভালো করছেন! স্ব-যত্ন এবং মাইন্ডফুলনেস চর্চা চালিয়ে যান। 🧘",
                "নিয়মিত ব্যায়াম এবং ভালো ঘুম আপনার মানসিক সুস্থতা বজায় রাখবে। 😴",
                "প্রিয়জনের সাথে সংযুক্ত থাকুন। সামাজিক সমর্থন গুরুত্বপূর্ণ। 💚"
            ]
        
        idx = random.randint(0, len(recommendations_bn) - 1)
        
        return {
            "recommendation_en": recommendations_bn[idx],
            "recommendation_bn": recommendations_bn[idx],
            "source": "fallback",
            "confidence": 0.60
        }

llm_service = LLMService()
