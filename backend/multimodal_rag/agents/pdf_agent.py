import PyPDF2
from io import BytesIO
from typing import List, Dict
import aiohttp

class PDFAgent:
    def __init__(self):
        self.ollama_url = "http://localhost:11434"
        self.model = "tinyllama:latest"
    
    async def extract_text(self, pdf_bytes: bytes) -> str:
        try:
            pdf_file = BytesIO(pdf_bytes)
            reader = PyPDF2.PdfReader(pdf_file)
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            return '\n'.join(text_parts)
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return ""
    
    async def process(self, pdf_bytes: bytes, user_query: str) -> str:
        extracted_text = await self.extract_text(pdf_bytes)
        
        if not extracted_text:
            return "PDF থেকে টেক্সট বের করতে পারেনি। ফাইলটি করাপ্ট বা ইমেজ স্ক্যান করা হতে পারে।"
        
        # Store in vector DB for future retrieval
        from multimodal_rag.services.vector_store import vector_store
        vector_store.add_documents(
            [extracted_text[:5000]],
            [{"source": "pdf_upload", "query": user_query}]
        )
        
        prompt = f"""তুমি "মেন্টাল সাথী" - একটি মানসিক স্বাস্থ্য সহায়ক চ্যাটবট।
PDF ডকুমেন্ট থেকে তথ্য:
{document_text}

ব্যবহারকারীর প্রশ্ন: "{user_query}"

ডকুমেন্টের তথ্যের ভিত্তিতে বাংলায় সঠিক উত্তর দিন:"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.5, "num_predict": 300}
                    },
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("response", "")
        except Exception as e:
            print(f"PDFAgent error: {e}")
        
        return f"PDF থেকে তথ্য: {extracted_text[:500]}..."

pdf_agent = PDFAgent()