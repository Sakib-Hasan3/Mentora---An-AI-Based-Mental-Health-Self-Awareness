import aiohttp
import os
from groq import Groq
from core.config import settings
from rag_system.services.vector_store import vector_store

class RAGService:
    def __init__(self):
        groq_api_key = settings.GROQ_API_KEY
        if groq_api_key:
            self.groq_client = Groq(api_key=groq_api_key)
            self.groq_available = True
            print("✅ Groq client initialized for RAG")
        else:
            self.groq_client = None
            self.groq_available = False
            print("⚠️ Groq not available for RAG")
        
        self.system_prompt = """তুমি "মেন্টাল সাথী" - একজন বন্ধুত্বপূর্ণ মানসিক স্বাস্থ্য সহায়ক।
তোমার কাজ:
1. প্রাসঙ্গিক তথ্য ব্যবহার করে সহানুভূতিশীল উত্তর দেওয়া
2. বাংলা ভাষায় উত্তর দেওয়া
3. সংক্ষিপ্ত (২-৩ বাক্য) এবং কার্যকর পরামর্শ দেওয়া
4. প্রয়োজনে হেল্পলাইন ১৬২৬৩ উল্লেখ করা"""
    
    async def get_response(self, query: str, k: int = 5) -> dict:
        # 1. Search for relevant documents
        relevant_docs = vector_store.search(query, k=k)
        
        # 2. Prepare context
        context = ""
        sources = []
        for doc in relevant_docs:
            context += doc['text'] + "\n"
            sources.append(doc.get('metadata', {}))
        
        # 3. If no context, use fallback
        if not context:
            return self._get_fallback_response(query)
        
        # 4. Create prompt
        prompt = f"""প্রসঙ্গ:
{context}

ব্যবহারকারীর প্রশ্ন: "{query}"

প্রসঙ্গের তথ্যের ভিত্তিতে ব্যবহারকারীকে একটি সহানুভূতিশীল উত্তর দিন (২-৩ বাক্যে)।"""
        
        # 5. Get response from LLM
        if self.groq_available:
            response = await self._call_groq(prompt)
            if response:
                return {
                    "response": response,
                    "sources": sources,
                    "context_used": True
                }
        
        # 6. Fallback
        return self._get_fallback_response(query)
    
    async def _call_groq(self, prompt: str) -> str:
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150,
                top_p=0.9,
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"❌ Groq API error: {e}")
            return None
    
    def _get_fallback_response(self, query: str) -> dict:
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['ডিপ্রেশন', 'বিষণ্ণ', 'খারাপ লাগা']):
            response = "আমি আপনার কথা শুনছি। ডিপ্রেশন একটি সাধারণ সমস্যা। দয়া করে একজন বিশেষজ্ঞের সাথে কথা বলুন। হেল্পলাইন: ১৬২৬৩ 💚"
        elif any(word in query_lower for word in ['উদ্বেগ', 'চিন্তা', 'টেনশন']):
            response = "উদ্বেগ কমানোর জন্য গভীর শ্বাস-প্রশ্বাসের ব্যায়াম করুন। ৫-৪-৩-২-১ গ্রাউন্ডিং টেকনিক ব্যবহার করতে পারেন। 🧘"
        elif any(word in query_lower for word in ['স্ট্রেস', 'চাপ']):
            response = "স্ট্রেস কমানোর জন্য নিয়মিত ব্যায়াম করুন। মেডিটেশন এবং গভীর শ্বাস-প্রশ্বাসের ব্যায়াম সাহায্য করতে পারে। 🧘"
        else:
            response = "আমি আপনার কথা শুনছি। আপনি আরও বিস্তারিত বলতে পারেন? আমি সাহায্য করতে চাই। 💚"
        
        return {
            "response": response,
            "sources": [],
            "context_used": False
        }

rag_service = RAGService()
