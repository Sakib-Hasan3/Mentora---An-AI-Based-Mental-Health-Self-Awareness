from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Union

class EmbeddingService:
    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2"):
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = 384
        print(f"✅ Embedding model loaded: {model_name}")
    
    def embed_text(self, text: str) -> List[float]:
        return self.model.encode(text).tolist()
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts).tolist()

embedding_service = EmbeddingService()
