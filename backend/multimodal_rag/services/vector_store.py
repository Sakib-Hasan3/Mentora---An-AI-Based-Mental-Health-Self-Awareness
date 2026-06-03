import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict
import uuid

class VectorStoreService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(
            name="mental_health_knowledge",
            embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="paraphrase-multilingual-MiniLM-L12-v2"
            )
        )
    
    def add_documents(self, documents: List[str], metadatas: List[Dict] = None):
        ids = [str(uuid.uuid4()) for _ in documents]
        self.collection.add(
            documents=documents,
            ids=ids,
            metadatas=metadatas
        )
        return ids
    
    def search(self, query: str, k: int = 5) -> List[Dict]:
        results = self.collection.query(
            query_texts=[query],
            n_results=k
        )
        return [
            {"text": doc, "metadata": meta}
            for doc, meta in zip(results['documents'][0], results['metadatas'][0])
        ] if results['documents'] else []

vector_store = VectorStoreService()