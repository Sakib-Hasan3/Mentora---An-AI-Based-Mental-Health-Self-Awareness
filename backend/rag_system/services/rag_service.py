import aiohttp
import httpx
import json
import asyncio
from typing import Dict, List, Optional
from core.config import settings
from rag_system.services.vector_store import vector_store

class RAGService:
    def __init__(self):
        # API Keys
        self.deepseek_key = settings.DEEPSEEK_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        
        # API Endpoints
        self.deepseek_url = "https://api.deepseek.com/v1/chat/completions"
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        
        # Priority order (Groq fastest → Gemini → DeepSeek)
        self.providers = [
            {"name": "groq", "key": self.groq_key, "url": self.groq_url},
            {"name": "gemini", "key": self.gemini_key, "url": self.gemini_url},
            {"name": "deepseek", "key": self.deepseek_key, "url": self.deepseek_url}
        ]
        
        # Check which providers are available
        self.available_providers = [p for p in self.providers if p["key"]]
        
        print(f"✅ Multi-LLM RAG Service initialized")
        print(f"   🔑 Groq: {'✅' if self.groq_key else '❌'}")
        print(f"   🔑 Gemini: {'✅' if self.gemini_key else '❌'}")
        print(f"   🔑 DeepSeek: {'✅' if self.deepseek_key else '❌'}")
        print(f"   📊 Available providers: {len(self.available_providers)}")
    
    async def get_response(self, query: str, k: int = 5) -> dict:
        """Get response using multi-LLM with auto fallback"""
        
        # 1. Search vector store for relevant documents
        relevant_docs = vector_store.search(query, k=k)
        
        context = ""
        sources = []
        for doc in relevant_docs:
            context += doc['text'] + "\n"
            sources.append(doc.get('metadata', {}))
        
        # 2. If no context, use fallback response
        if not context:
            return self._get_fallback_response(query)
        
        # 3. Try each provider in priority order
        for provider in self.available_providers:
            print(f"🔄 Trying {provider['name']}...")
            
            try:
                response = await self._call_provider(provider, query, context)
                if response:
                    print(f"✅ {provider['name']} responded successfully")
                    return {
                        "response": response,
                        "sources": sources,
                        "context_used": True,
                        "provider": provider['name']
                    }
            except Exception as e:
                print(f"❌ {provider['name']} failed: {e}")
                continue
        
        # 4. All providers failed, use fallback
        return self._get_fallback_response_with_context(query, context)
    
    async def _call_provider(self, provider: dict, query: str, context: str) -> Optional[str]:
        """Call a specific provider API"""
        name = provider["name"]
        
        if name == "groq":
            return await self._call_groq(provider["key"], query, context)
        elif name == "gemini":
            return await self._call_gemini(provider["key"], query, context)
        elif name == "deepseek":
            return await self._call_deepseek(provider["key"], query, context)
        return None
    
    async def _call_groq(self, api_key: str, query: str, context: str) -> Optional[str]:
        """Call Groq API"""
        try:
            prompt = f"""প্রসঙ্গ:
{context}

ব্যবহারকারীর প্রশ্ন: "{query}"

প্রসঙ্গের তথ্যের ভিত্তিতে ব্যবহারকারীকে একটি সহানুভূতিশীল উত্তর দিন (২-৩ বাক্যে)।"""
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.groq_url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "তুমি 'মেন্টাল সাথী' - একজন বন্ধুত্বপূর্ণ মানসিক স্বাস্থ্য সহায়ক।"},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 400 
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data['choices'][0]['message']['content'].strip()
                else:
                    print(f"Groq error: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Groq exception: {e}")
            return None
    
    async def _call_gemini(self, api_key: str, query: str, context: str) -> Optional[str]:
        """Call Gemini API"""
        try:
            prompt = f"""প্রসঙ্গ:
{context}

ব্যবহারকারীর প্রশ্ন: "{query}"

প্রসঙ্গের তথ্যের ভিত্তিতে ব্যবহারকারীকে একটি সহানুভূতিশীল উত্তর দিন (২-৩ বাক্যে)।"""
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.gemini_url}?key={api_key}",
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }],
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 150
                        }
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data['candidates'][0]['content']['parts'][0]['text'].strip()
                else:
                    print(f"Gemini error: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Gemini exception: {e}")
            return None
    
    async def _call_deepseek(self, api_key: str, query: str, context: str) -> Optional[str]:
        """Call DeepSeek API"""
        try:
            prompt = f"""প্রসঙ্গ:
{context}

ব্যবহারকারীর প্রশ্ন: "{query}"

প্রসঙ্গের তথ্যের ভিত্তিতে ব্যবহারকারীকে একটি সহানুভূতিশীল উত্তর দিন (২-৩ বাক্যে)।"""
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.deepseek_url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": "তুমি 'মেন্টাল সাথী' - একজন বন্ধুত্বপূর্ণ মানসিক স্বাস্থ্য সহায়ক।"},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 400
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data['choices'][0]['message']['content'].strip()
                else:
                    print(f"DeepSeek error: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"DeepSeek exception: {e}")
            return None
    
    def _get_fallback_response_with_context(self, query: str, context: str) -> dict:
        """Fallback with context"""
        context_lines = context.split('\n')
        relevant_info = [line for line in context_lines if line.strip()]
        
        if relevant_info:
            response = f"{relevant_info[0]} 💚"
        else:
            response = "আমি আপনার কথা শুনছি। আপনি আরও বিস্তারিত বলতে পারেন? 💚"
        
        return {
            "response": response,
            "sources": [],
            "context_used": False,
            "provider": "fallback"
        }
    
    def _get_fallback_response(self, query: str) -> dict:
        """Pure fallback response"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['ডিপ্রেশন', 'বিষণ্ণ', 'খারাপ লাগা']):
            response = "আমি আপনার কথা শুনছি। ডিপ্রেশন একটি সাধারণ সমস্যা। দয়া করে একজন বিশেষজ্ঞের সাথে কথা বলুন। হেল্পলাইন: ১৬২৬৩ 💚"
        elif any(word in query_lower for word in ['উদ্বেগ', 'চিন্তা', 'টেনশন']):
            response = "উদ্বেগ কমানোর জন্য গভীর শ্বাস-প্রশ্বাসের ব্যায়াম করুন। ৫-৪-৩-২-১ গ্রাউন্ডিং টেকনিক ব্যবহার করতে পারেন। 🧘"
        elif any(word in query_lower for word in ['স্ট্রেস', 'চাপ']):
            response = "স্ট্রেস কমানোর জন্য নিয়মিত ব্যায়াম করুন। মেডিটেশন এবং গভীর শ্বাস-প্রশ্বাসের ব্যায়াম সাহায্য করতে পারে। 🧘"
        elif any(word in query_lower for word in ['ঘুম', 'sleep']):
            response = "নিয়মিত ঘুমের সময় নির্ধারণ করুন। ঘুমানোর আগে ১ ঘন্টা মোবাইল ব্যবহার বন্ধ রাখুন। 😴"
        elif any(word in query_lower for word in ['একা', 'alone']):
            response = "আপনি একা নন। বন্ধু বা পরিবারের সাথে কথা বলুন। হেল্পলাইন: ১৬২৬৩ 💚"
        else:
            response = "আমি আপনার কথা শুনছি। আপনি আরও বিস্তারিত বলতে পারেন? আমি সাহায্য করতে চাই। 💚"
        
        return {
            "response": response,
            "sources": [],
            "context_used": False,
            "provider": "fallback"
        }

rag_service = RAGService()
