import base64
import aiohttp
import pytesseract
from PIL import Image
import io
import easyocr
from typing import Optional

class ImageAgent:
    def __init__(self):
        self.ollama_url = "http://localhost:11434"
        self.model = "tinyllama:latest"
        # EasyOCR for Bangla + English
        try:
            self.reader = easyocr.Reader(['bn', 'en'], gpu=False)
            print("✅ EasyOCR initialized for Bangla")
        except:
            self.reader = None
            print("⚠️ EasyOCR not available, using Tesseract")
    
    async def extract_text_from_image(self, image_bytes: bytes) -> str:
        """OCR using EasyOCR (better for Bangla) or Tesseract"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # Try EasyOCR first (better for Bangla)
            if self.reader:
                import numpy as np
                image_np = np.array(image)
                result = self.reader.readtext(image_np)
                if result:
                    texts = [item[1] for item in result]
                    return ' '.join(texts)
            
            # Fallback to Tesseract
            text = pytesseract.image_to_string(image, lang='ben+eng')
            return text.strip()
            
        except Exception as e:
            print(f"OCR error: {e}")
            return ""
    
    async def generate_description(self, image_bytes: bytes) -> str:
        """Generate image description using Ollama vision capabilities"""
        try:
            img_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": "বাংলায় এই ছবির একটি সংক্ষিপ্ত বিবরণ দিন:",
                        "images": [img_base64],
                        "stream": False,
                        "options": {"temperature": 0.7, "num_predict": 100}
                    },
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("response", "")
        except Exception as e:
            print(f"Image description error: {e}")
        
        return ""
    
    async def process(self, image_bytes: bytes, user_query: str = "") -> str:
        extracted_text = await self.extract_text_from_image(image_bytes)
        description = await self.generate_description(image_bytes)
        
        prompt = f"""তুমি "মেন্টাল সাথী" - একটি মানসিক স্বাস্থ্য সহায়ক চ্যাটবট।
ছবি থেকে পাওয়া তথ্য:
- OCR টেক্সট: {extracted_text[:500] if extracted_text else 'কোনো টেক্সট পাওয়া যায়নি'}
- ছবির বিবরণ: {description}

ব্যবহারকারীর প্রশ্ন: "{user_query if user_query else 'এই ছবিতে কি আছে?'}"

বাংলায় সংক্ষিপ্ত, সহায়ক উত্তর দিন:"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.7, "num_predict": 200}
                    },
                    timeout=aiohttp.ClientTimeout(total=45)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("response", "")
        except Exception as e:
            print(f"ImageAgent error: {e}")
        
        if extracted_text:
            return f"ছবিতে পাওয়া টেক্সট: {extracted_text[:200]}"
        return "আমি ছবিটি দেখছি। আপনি কি জানতে চান? 💚"

image_agent = ImageAgent()
