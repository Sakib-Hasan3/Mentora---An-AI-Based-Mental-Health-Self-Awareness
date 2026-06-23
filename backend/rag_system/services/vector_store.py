import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Any
import uuid
from pathlib import Path

class VectorStoreService:
    def __init__(self, collection_name: str = "mental_health_knowledge"):
        persist_dir = Path(__file__).parent.parent.parent / "chroma_db"
        persist_dir.mkdir(exist_ok=True)
        
        self.client = chromadb.PersistentClient(path=str(persist_dir))
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="paraphrase-multilingual-MiniLM-L12-v2"
        )
        
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_fn
        )
        
        print(f"✅ Vector store initialized: {collection_name}")
        print(f"   Total documents: {self.collection.count()}")
    
    def add_documents(self, documents: List[str], metadatas: List[Dict] = None):
        ids = [str(uuid.uuid4()) for _ in documents]
        if metadatas is None:
            metadatas = [{"source": "knowledge_base"} for _ in documents]
        
        self.collection.add(
            documents=documents,
            ids=ids,
            metadatas=metadatas
        )
        return ids
    
    def search(self, query: str, k: int = 5) -> List[Dict]:
        results = self.collection.query(query_texts=[query], n_results=k)
        
        if results and results['documents']:
            docs = []
            for i, doc in enumerate(results['documents'][0]):
                docs.append({
                    "text": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else None
                })
            return docs
        return []
    
    def get_all_documents(self) -> List[str]:
        all_data = self.collection.get()
        return all_data['documents'] if all_data else []

vector_store = VectorStoreService()
