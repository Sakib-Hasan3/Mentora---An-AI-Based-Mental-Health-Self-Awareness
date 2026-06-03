from typing import Dict, Any
from multimodal_rag.services.vector_store import vector_store
from multimodal_rag.agents.text_agent import text_agent
from multimodal_rag.agents.image_agent import image_agent
from multimodal_rag.agents.pdf_agent import pdf_agent

class RAGChain:
    async def process(self, input_type: str, content: Any, query: str = "") -> Dict:
        if input_type == "text":
            # Search knowledge base first
            relevant_docs = vector_store.search(query if query else content, k=3)
            context = "\n".join([doc['text'] for doc in relevant_docs])
            response = await text_agent.process(content, context)
            
        elif input_type == "image":
            response = await image_agent.process(content, query)
            
        elif input_type == "pdf":
            response = await pdf_agent.process(content, query)
            
        else:
            response = await text_agent.process(content)
        
        return {
            "success": True,
            "response": response,
            "input_type": input_type
        }

rag_chain = RAGChain()