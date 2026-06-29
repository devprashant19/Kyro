from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ContextCaptureRequest, ChatRequest, ChatResponse
from app.services.memory_service import add_memory, search_memories
# from app.services.ai_service import generate_chat_response

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
        # TODO: Retrieve relevant memories from Cognee based on latest message
        # TODO: Generate response using Gemini bounding it to retrieved memories
        user_msg = request.messages[-1].content
        return ChatResponse(
            answer=f"Simulated response to: {user_msg}. (Cognee and Gemini integration pending)",
            sources=[{"title": "Example Source", "url": "https://example.com"}],
            related_memories=[{"id": "node_1", "label": "Example Concept"}]
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
