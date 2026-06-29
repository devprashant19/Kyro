from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ContextCaptureRequest, ChatRequest, ChatResponse
from app.services.memory_service import add_memory, search_memories
import google.generativeai as genai
import os

# Initialize Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-pro')

router = APIRouter()

@router.post("/capture")
async def capture_context(request: ContextCaptureRequest):
    """
    Endpoint for the browser extension to push captured context.
    """
    try:
        # Send data to Cognee memory service
        await add_memory(request.dict())
        print(f"Captured and Cognitified: {request.title} from {request.domain}")
        return {"status": "success", "message": "Context captured and sent to memory pipeline."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint for the Next.js Dashboard to interact with the AI.
    """
    try:
        user_msg = request.messages[-1].content
        
        # 1. Retrieve relevant memories from Cognee
        memories = await search_memories(user_msg)
        
        # Format memories for the prompt
        context_text = ""
        related_memories = []
        if memories:
            for i, mem in enumerate(memories):
                context_text += f"[{i+1}] {mem.get('text', '')}\\n"
                related_memories.append({"id": mem.get('id', str(i)), "label": mem.get('text', '')[:30] + "..."})
                
        # 2. Generate response using Gemini bounding it to retrieved memories
        prompt = f"""You are Kyro, an AI assistant with a perfect memory powered by Cognee.
        The user has asked a question. Answer it using ONLY the retrieved memories below.
        If the memories do not contain the answer, say you don't remember any context about that.
        
        Retrieved Memories:
        {context_text}
        
        User Question: {user_msg}
        """
        
        response = model.generate_content(prompt)
        
        return ChatResponse(
            answer=response.text,
            sources=[],
            related_memories=related_memories
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph")
async def get_knowledge_graph():
    """
    Endpoint to retrieve graph nodes and edges for React Flow visualization.
    """
    # TODO: Fetch graph from Cognee
    return {
        "nodes": [
            {"id": "1", "data": {"label": "You"}, "position": {"x": 250, "y": 5}},
            {"id": "2", "data": {"label": "React"}, "position": {"x": 100, "y": 100}},
            {"id": "3", "data": {"label": "Cognee"}, "position": {"x": 400, "y": 100}},
        ],
        "edges": [
            {"id": "e1-2", "source": "1", "target": "2", "label": "knows"},
            {"id": "e1-3", "source": "1", "target": "3", "label": "built_with"},
        ]
    }
