from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ContextCaptureRequest, ChatRequest, ChatResponse, ApiKeyRequest
from app.services.memory_service import add_memory, search_memories
import google.generativeai as genai
import os

# Initialize Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-pro')

router = APIRouter()

recent_captures = []

@router.post("/capture")
async def capture_context(request: ContextCaptureRequest):
    """
    Endpoint for the browser extension to push captured context.
    """
    try:
        # Cache for the live feed
        global recent_captures
        capture_data = request.dict()
        recent_captures.insert(0, capture_data)
        if len(recent_captures) > 50:
            recent_captures.pop()
            
        # Send data to Cognee memory service
        await add_memory(capture_data)
        print(f"Captured and Cognitified: {request.title} from {request.domain}")
        return {"status": "success", "message": "Context captured and sent to memory pipeline."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent")
async def get_recent_captures():
    """
    Endpoint to fetch the recent memory captures for the Live Feed.
    """
    return {"captures": recent_captures}

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
    For the hackathon MVP, we generate a beautiful simulated knowledge graph layout
    until the native Cognee NetworkX extractors are fully written.
    """
    import random
    
    # Central Hub
    nodes = [{"id": "core", "data": {"label": "Kyro Core"}, "position": {"x": 400, "y": 250}}]
    edges = []
    
    # Simulate a cluster of concepts
    concepts = ["React Flow", "Cognee RAG", "Gemini 1.5", "Chrome Extension", "TailwindCSS", "PostgreSQL", "FastAPI"]
    
    radius = 200
    import math
    
    for i, concept in enumerate(concepts):
        angle = (i / len(concepts)) * 2 * math.pi
        x = 400 + radius * math.cos(angle) + random.randint(-20, 20)
        y = 250 + radius * math.sin(angle) + random.randint(-20, 20)
        
        node_id = f"n_{i}"
        nodes.append({"id": node_id, "data": {"label": concept}, "position": {"x": x, "y": y}})
        edges.append({"id": f"e_core_{i}", "source": "core", "target": node_id})
        
        # Add a sub-node to some concepts
        if random.random() > 0.3:
            sub_x = x + 100 * math.cos(angle)
            sub_y = y + 100 * math.sin(angle)
            sub_id = f"sub_{i}"
            nodes.append({"id": sub_id, "data": {"label": "Memory Fragment"}, "position": {"x": sub_x, "y": sub_y}})
            edges.append({"id": f"e_sub_{i}", "source": node_id, "target": sub_id})

    return {
        "nodes": nodes,
        "edges": edges
    }

@router.post("/settings/apikey")
async def update_api_key(request: ApiKeyRequest):
    """
    Dynamically update the Gemini API key used by the backend.
    """
    try:
        os.environ["GEMINI_API_KEY"] = request.api_key
        # Re-configure Google Generative AI
        genai.configure(api_key=request.api_key)
        
        # We might also need to re-initialize Cognee if it cached the key
        from app.services.memory_service import setup_cognee
        await setup_cognee()
        
        print("Successfully updated Gemini API Key dynamically.")
        return {"status": "success", "message": "API Key updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
