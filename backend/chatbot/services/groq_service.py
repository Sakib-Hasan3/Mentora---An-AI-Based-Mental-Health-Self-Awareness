import os
from groq import Groq
from core.config import settings

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = Groq(api_key=self.api_key)
        self.model = "llama3-8b-8192"

    async def generate_response(self, message: str, conversation_history: list = None) -> str:
        if not self.api_key:
            return "Groq API key is not configured."

        messages = []
        if conversation_history:
            for msg in conversation_history:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": message})

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API error: {e}")
            return "I am having trouble connecting to the Groq service."

groq_service = GroqService()
