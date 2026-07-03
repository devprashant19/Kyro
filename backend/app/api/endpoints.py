from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Request, UploadFile, File, Query
from app.models.schemas import ContextCaptureRequest, ChatRequest, ChatResponse, ApiKeyRequest, GraphResponse, RecentCapturesResponse, FeedbackRequest, CustomIngestionRequest

from app.services.cache_service import cache, KEY_ACTIVITY
from app.core.database import persist_capture, fetch_recent_captures, is_db_connected
import google.generativeai as genai
from app.services.memory_service import add_memory, search_memories, prune_stale_memories
import os
import json
import io
import pypdf
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Initialize Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

router = APIRouter()

# Seed the in-memory array with some realistic hackathon data
import datetime
now = datetime.datetime.now().isoformat()

recent_captures = [
    {
        "title": "React Flow Documentation",
        "url": "https://reactflow.dev/docs",
        "domain": "reactflow.dev",
        "type": "Document",
        "text": "React Flow is a highly customizable React component for building node-based editors and interactive diagrams.",
        "timestamp": now
    },
    {
        "title": "FastAPI WebSockets",
        "url": "https://fastapi.tiangolo.com/advanced/websockets/",
        "domain": "fastapi.tiangolo.com",
        "type": "Document",
        "text": "You can use WebSockets with FastAPI to create live interactive applications.",
        "timestamp": now
    },
    {
        "title": "Pull Request: Fix Graph Optimization",
        "url": "https://github.com/Kyro/Kyro-App/pull/42",
        "domain": "github.com",
        "type": "Repository",
        "text": "This PR optimizes the force-directed graph algorithm for handling 10,000+ nodes smoothly.",
        "timestamp": now
    },
    {
        "title": "Understanding Cognee RAG",
        "url": "https://docs.cognee.ai",
        "domain": "docs.cognee.ai",
        "type": "Concept",
        "text": "Cognee is an open-source framework for building deterministic AI applications with Knowledge Graphs.",
        "timestamp": now
    }
]

@router.post("/capture")
async def capture_context(request: ContextCaptureRequest):
    """
    Endpoint for the browser extension to push captured context.
    """
    try:
        # 1. Keep the in-memory hot-cache for the live feed (fastest)
        global recent_captures
        capture_data = request.dict()
        recent_captures.insert(0, capture_data)
        if len(recent_captures) > 50:
            recent_captures.pop()
            
        # 2. Persist durably to PostgreSQL (survives server restarts)
        persisted = await persist_capture(capture_data)
        if persisted:
            logger.info(f"Persisted to DB: {request.title}")
        else:
            logger.debug("DB not available — capture stored in-memory only.")

        # 3. Send data to Cognee knowledge graph / RAG pipeline
        await add_memory(capture_data)
        
        # 4. Invalidate the activity heatmap cache so next request reflects new data
        await cache.invalidate(KEY_ACTIVITY)
        
        logger.info(f"Captured and Cognitified: {request.title} from {request.domain}")
        return {"status": "success", "message": "Context captured and sent to memory pipeline."}
    except Exception as e:
        logger.error(f"Error capturing context: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/capture")
async def websocket_capture(websocket: WebSocket):
    """
    WebSocket endpoint for the browser extension to push captured context continuously.
    """
    await websocket.accept()
    logger.info("WebSocket connection established with extension.")
    try:
        global recent_captures
        while True:
            # Wait for data from the extension
            data = await websocket.receive_text()
            try:
                capture_data = json.loads(data)
                
                # Cache for the live feed
                if capture_data.get("type") == "BATCH":
                    payloads = capture_data.get("payloads", [])
                    for payload in payloads:
                        recent_captures.insert(0, payload)
                        if len(recent_captures) > 50:
                            recent_captures.pop()
                        await persist_capture(payload)
                        await add_memory(payload)
                        logger.info(f"Captured (WS Batch) and Cognitified: {payload.get('title')} from {payload.get('domain')}")
                else:
                    recent_captures.insert(0, capture_data)
                    if len(recent_captures) > 50:
                        recent_captures.pop()
                    await add_memory(capture_data)
                    logger.info(f"Captured (WS Single) and Cognitified: {capture_data.get('title')} from {capture_data.get('domain')}")
                
                # Acknowledge receipt
                await websocket.send_json({"status": "success", "message": "Context batch processed."})
            except json.JSONDecodeError:
                logger.error("Invalid JSON received over WS")
                await websocket.send_json({"status": "error", "message": "Invalid JSON"})
            except Exception as inner_e:
                logger.error(f"Error processing WS payload: {str(inner_e)}", exc_info=True)
                await websocket.send_json({"status": "error", "message": str(inner_e)})
    except WebSocketDisconnect:
        logger.info("Extension disconnected from WebSocket.")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}", exc_info=True)

@router.get("/recent", response_model=RecentCapturesResponse)
async def get_recent_captures():
    """
    Endpoint to fetch the recent memory captures for the Live Feed.
    Serves from the in-memory hot-cache first; falls back to PostgreSQL
    after a server restart (when the hot-cache is empty).
    """
    global recent_captures
    if recent_captures:
        return {"captures": recent_captures}
    
    # Fallback: hydrate from PostgreSQL
    if is_db_connected():
        logger.info("In-memory cache empty — hydrating from PostgreSQL...")
        db_captures = await fetch_recent_captures(limit=50)
        if db_captures:
            recent_captures = db_captures  # Re-warm the in-memory cache
        return {"captures": db_captures}
    
    return {"captures": []}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint for the Next.js Dashboard to interact with the AI.
    """
    try:
        # Extract the latest user query
        user_msg = request.messages[-1].content
        
        # Extract conversational history (last 5 messages excluding the current one)
        chat_history = ""
        if len(request.messages) > 1:
            history_messages = request.messages[-6:-1]
            for msg in history_messages:
                role = "User" if msg.role == "user" else "Kyro"
                chat_history += f"{role}: {msg.content}\n"
        
        # 1. Retrieve relevant memories from Cognee using the latest query
        memories = await search_memories(user_msg)
        
        # Format memories for the prompt
        context_text = ""
        related_memories = []
        if memories:
            for i, mem in enumerate(memories):
                context_text += f"[{i+1}] {mem.get('text', '')}\n"
                related_memories.append({"id": mem.get('id', str(i)), "label": mem.get('text', '')[:30] + "..."})
                
        # 2. Generate response using Gemini bounded to retrieved memories with Chain of Thought
        prompt = f"""You are Kyro, an advanced AI assistant with a perfect memory powered by a Cognee Knowledge Graph.
        
        The user has asked a question. You MUST answer it using ONLY the retrieved memories below and the context of the Conversation History.
        If the memories do not contain the answer, explicitly state that you don't remember any context about that. Do not hallucinate external knowledge.
        
        INSTRUCTIONS (Chain of Thought):
        Before answering, silently analyze the retrieved memories step-by-step to determine how they relate to the user's question.
        1. Identify the core entities in the user's question.
        2. Scan the retrieved memories for direct mentions or semantic matches to these entities.
        3. Synthesize the relevant facts into a coherent, accurate answer.
        
        FORMAT YOUR RESPONSE AS:
        **Analysis:** (A brief 1-2 sentence summary of how you arrived at the answer based on the memories)
        **Answer:** (Your final synthesized answer)
        
        Conversation History:
        {chat_history if chat_history else "No previous conversation."}
        
        Retrieved Memories:
        {context_text if context_text else "No memories found."}
        
        User Question: {user_msg}
        """
        
        response = model.generate_content(prompt)
        
        return ChatResponse(
            answer=response.text,
            sources=[],
            related_memories=related_memories
        )
    except Exception as e:
        logger.error(f"Error during chat: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/retrieve")
async def retrieve_context(q: str = Query(..., description="The query string"), deviceId: str = None):
    """
    Endpoint for the browser extension to retrieve context for prompt injection.
    """
    try:
        results = await search_memories(q)
        memories = [res.get("text", "") for res in results] if results else []
        return {"status": "success", "memories": memories}
    except Exception as e:
        logger.error(f"Error retrieving context: {str(e)}", exc_info=True)
        return {"status": "error", "memories": []}

@router.get("/graph", response_model=GraphResponse)
async def get_knowledge_graph(date: str = None):
    """
    Endpoint to retrieve graph nodes and edges for React Flow visualization.
    Pulls native graph data directly from Cognee.
    Includes Time-Travel capability via the optional `date` query parameter.
    """
    import math
    import random
    from datetime import datetime, timedelta
    from app.services.memory_service import get_graph_data as fetch_cognee_graph
    
    cognee_graph = await fetch_cognee_graph()
    
    if cognee_graph and cognee_graph.get("nodes"):
        rf_nodes = []
        rf_edges = []
        
        raw_nodes = cognee_graph["nodes"]
        raw_edges = cognee_graph["edges"]
        
        # Parse the requested time-travel date if provided
        target_date = None
        if date:
            try:
                # Expecting ISO format or YYYY-MM-DD
                target_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            except Exception:
                target_date = None

        # Spiral Layout Algorithm for React Flow Coordinate mapping
        center_x = 400
        center_y = 300
        angle = 0
        radius = 50
        
        # We need a list of valid node IDs that survived the time filter
        valid_node_ids = set()
        
        # Map Nodes
        for i, node in enumerate(raw_nodes):
            # Try to grab a label safely depending on what cognee returns (dict or tuple)
            node_id = str(node.get("id", i)) if isinstance(node, dict) else str(node[0] if isinstance(node, tuple) else node)
            label = node.get("id", str(node)) if isinstance(node, dict) else str(node[0] if isinstance(node, tuple) else node)
            
            # Extract type
            node_type = "Concept"
            if isinstance(node, tuple) and len(node) > 1 and isinstance(node[1], dict):
                node_type = node[1].get("type", node_type)
            else:
                # For MVP demo purposes, randomly assign if Cognee doesn't provide one
                node_type = random.choice(["Person", "Document", "Concept", "Repository"])
                
            # MVP Hackathon: Mock timestamps if they don't exist natively yet
            # Distribute nodes randomly over the last 30 days
            mock_created_at = datetime.now() - timedelta(days=(i % 30))
            
            # TIME TRAVEL FILTERING: If a date is provided, filter out nodes created AFTER that date
            if target_date and mock_created_at > target_date:
                continue # Skip this node! It didn't exist yet!
                
            valid_node_ids.add(node_id)
            
            # Optimize layout algorithm dynamically for huge graphs
            # We widen the spiral gap if there are thousands of nodes to prevent visual crushing
            radius_step = 5 if len(raw_nodes) < 1000 else 15
            angle_step = 0.5 if len(raw_nodes) < 1000 else 0.1
            
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            
            angle += angle_step
            radius += radius_step
            
            rf_nodes.append({
                "id": node_id,
                "data": {"label": label[:30], "type": node_type, "created_at": mock_created_at.isoformat()},
                "position": {"x": x, "y": y}
            })
            
        # Map Edges
        for i, edge in enumerate(raw_edges):
            if isinstance(edge, dict):
                source = str(edge.get("source", ""))
                target = str(edge.get("target", ""))
            elif isinstance(edge, tuple) and len(edge) >= 2:
                source = str(edge[0])
                target = str(edge[1])
            else:
                continue
                
            # TIME TRAVEL FILTERING: Ensure both source and target existed at this point in time
            if source not in valid_node_ids or target not in valid_node_ids:
                continue
                
            rf_edges.append({
                "id": f"e_{source}_{target}_{i}",
                "source": source,
                "target": target
            })
            
        if not rf_nodes:
            # Fallback if time-travel filtered everything
            return {
                "nodes": [{"id": "core", "data": {"label": "Kyro Core (Empty Graph)", "type": "Concept"}, "position": {"x": 400, "y": 250}}],
                "edges": []
            }
            
        return {
            "nodes": rf_nodes,
            "edges": rf_edges
        }

    # Fallback: Generate a dynamic graph from actual recent captures if Cognee is empty
    global recent_captures
    if not recent_captures:
        # Absolute empty state
        return {
            "nodes": [{"id": "core", "data": {"label": "Kyro Context OS", "type": "Concept"}, "position": {"x": 400, "y": 300}}],
            "edges": []
        }
        
    nodes = [{"id": "core", "data": {"label": "Kyro User", "type": "Person"}, "position": {"x": 400, "y": 300}}]
    edges = []
    
    import math
    
    # Extract unique domains to build intermediate cluster nodes
    domains = list(set([cap.get("domain", "unknown") for cap in recent_captures if cap.get("domain")]))
    
    domain_radius = 150
    for i, domain in enumerate(domains):
        angle = (i / len(domains)) * 2 * math.pi
        x = 400 + domain_radius * math.cos(angle)
        y = 300 + domain_radius * math.sin(angle)
        domain_id = f"domain_{i}"
        
        nodes.append({
            "id": domain_id,
            "data": {"label": domain, "type": "Repository"},
            "position": {"x": x, "y": y}
        })
        edges.append({"id": f"e_core_{domain_id}", "source": "core", "target": domain_id})
        
    # Attach individual captures to their domain clusters
    cap_radius = 80
    domain_cap_counts = {d: 0 for d in domains}
    
    for i, cap in enumerate(recent_captures):
        domain = cap.get("domain", "unknown")
        domain_idx = domains.index(domain) if domain in domains else 0
        domain_id = f"domain_{domain_idx}"
        
        # Calculate base x,y of the domain
        dx = nodes[domain_idx + 1]["position"]["x"]
        dy = nodes[domain_idx + 1]["position"]["y"]
        
        # Offset the capture node in a small circle around the domain
        count = domain_cap_counts.get(domain, 0)
        c_angle = count * 0.5
        cx = dx + cap_radius * math.cos(c_angle)
        cy = dy + cap_radius * math.sin(c_angle)
        
        cap_id = f"cap_{i}"
        node_type = "Document"
        if "github" in domain.lower(): node_type = "Repository"
        elif "youtube" in domain.lower(): node_type = "Concept"
        
        nodes.append({
            "id": cap_id,
            "data": {"label": cap.get("title", "Unknown")[:30], "type": node_type},
            "position": {"x": cx, "y": cy}
        })
        edges.append({"id": f"e_{domain_id}_{cap_id}", "source": domain_id, "target": cap_id})
        
        domain_cap_counts[domain] = count + 1

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
        
        logger.info("Successfully updated Gemini API Key dynamically.")
        return {"status": "success", "message": "API Key updated successfully"}
    except Exception as e:
        logger.error(f"Error updating API key: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prune")
async def prune_graph_endpoint():
    """
    Endpoint to trigger the graph pruning algorithm.
    Scans the underlying Cognee database for duplicate memory nodes and deletes them.
    """
    try:
        logger.info("Starting graph pruning algorithm...")
        result = await prune_stale_memories()
        logger.info(f"Graph pruning complete: {result}")
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))
            
        return result
    except Exception as e:
        logger.error(f"Error in /prune endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Endpoint for submitting user feedback (RLHF) on a chat response.
    Updates the weight of the memories used in the response.
    """
    try:
        from app.services.memory_service import adjust_memory_weights
        
        adjust_memory_weights(request.memory_ids, request.rating)
        
        action = "boosted" if request.rating > 0 else "penalized"
        logger.info(f"RLHF Feedback received. {len(request.memory_ids)} memories {action}.")
        
        return {"status": "success", "message": f"Feedback applied. Memories {action}."}
    except Exception as e:
        logger.error(f"Error applying feedback: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/email")
async def trigger_email_ingestion():
    """
    Manual trigger to fetch unread emails via IMAP and ingest them into the memory graph.
    """
    try:
        from app.services.email_service import fetch_unread_emails
        logger.info("Starting manual email ingestion sync...")
        result = await fetch_unread_emails()
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))
            
        return result
    except Exception as e:
        logger.error(f"Error triggering email sync: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhooks/github")
async def github_webhook(request: Request):
    """
    Endpoint to receive and process GitHub Webhook events.
    Currently tracks push (commits), pull_request, and issues events.
    """
    try:
        # Get the event type from GitHub headers
        event_type = request.headers.get("X-GitHub-Event")
        if not event_type:
            return {"status": "ignored", "message": "Missing X-GitHub-Event header"}
            
        payload = await request.json()
        repository = payload.get("repository", {}).get("full_name", "Unknown Repo")
        repo_url = payload.get("repository", {}).get("html_url", "https://github.com")
        sender = payload.get("sender", {}).get("login", "Unknown User")
        
        memories_added = 0
        
        if event_type == "push":
            commits = payload.get("commits", [])
            for commit in commits:
                msg = commit.get("message", "")
                author = commit.get("author", {}).get("name", sender)
                url = commit.get("url", repo_url)
                
                context_data = {
                    "title": f"Git Commit: {repository}",
                    "url": url,
                    "text": f"Repository: {repository}\nAuthor: {author}\nCommit Message: {msg}",
                    "type": "github_commit"
                }
                await add_memory(context_data)
                memories_added += 1
                
        elif event_type == "pull_request":
            action = payload.get("action")
            pr = payload.get("pull_request", {})
            title = pr.get("title", "")
            body = pr.get("body", "")
            url = pr.get("html_url", repo_url)
            
            context_data = {
                "title": f"Pull Request ({action}): {title}",
                "url": url,
                "text": f"Repository: {repository}\nAction: {action}\nPR Title: {title}\nDescription:\n{body}",
                "type": "github_pr"
            }
            await add_memory(context_data)
            memories_added += 1
            
        elif event_type == "issues":
            action = payload.get("action")
            issue = payload.get("issue", {})
            title = issue.get("title", "")
            body = issue.get("body", "")
            url = issue.get("html_url", repo_url)
            
            context_data = {
                "title": f"Issue ({action}): {title}",
                "url": url,
                "text": f"Repository: {repository}\nAction: {action}\nIssue Title: {title}\nDescription:\n{body}",
                "type": "github_issue"
            }
            await add_memory(context_data)
            memories_added += 1
        else:
            return {"status": "ignored", "message": f"Event type '{event_type}' not tracked."}
            
        logger.info(f"Processed GitHub Webhook ({event_type}) - Added {memories_added} memories.")
        return {"status": "success", "message": f"Processed {event_type} event", "memories_added": memories_added}
        
    except Exception as e:
        logger.error(f"Error processing GitHub webhook: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Endpoint to upload and ingest a PDF document.
    Extracts text from all pages and pushes it to the Semantic Chunker and Cognee Graph.
    """
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")
            
        logger.info(f"Processing PDF upload: {file.filename}")
        
        # Read the file stream into memory
        contents = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(contents))
        
        extracted_text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            extracted_text += page.extract_text() + "\n\n"
            
        if not extracted_text.strip():
            return {"status": "ignored", "message": "No text could be extracted from the PDF."}
            
        # Push to memory service
        context_data = {
            "title": f"PDF Document: {file.filename}",
            "url": f"local://pdf/{file.filename}",
            "text": extracted_text,
            "type": "pdf_upload"
        }
        
        await add_memory(context_data)
        
        logger.info(f"Successfully ingested PDF: {file.filename} ({len(pdf_reader.pages)} pages)")
        
        return {
            "status": "success", 
            "message": f"Successfully ingested {file.filename}", 
            "pages": len(pdf_reader.pages)
        }
        
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/custom")
async def ingest_custom_data(request: CustomIngestionRequest):
    """
    Generic RESTful endpoint to ingest arbitrary data into the Kyro memory graph.
    Useful for cURL scripts, Slack bots, or other custom integrations.
    """
    try:
        logger.info(f"Received custom ingestion request: {request.title}")
        
        context_data = {
            "title": request.title,
            "url": request.url,
            "text": request.text,
            "type": "custom_api",
            "metadata": request.metadata
        }
        
        await add_memory(context_data)
        
        return {"status": "success", "message": f"Successfully ingested: {request.title}"}
        
    except Exception as e:
        logger.error(f"Error in custom ingestion API: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/activity")
async def get_activity_heatmap():
    """
    Returns activity data for the last 90 days from the database.
    """
    import datetime
    try:
        from app.core.database import get_daily_activity
        db_activity = await get_daily_activity(90)
        
        activity = []
        today = datetime.date.today()
        
        for i in range(89, -1, -1):
            date_obj = today - datetime.timedelta(days=i)
            date_str = date_obj.isoformat()
            
            # Fetch count from real DB query
            capture_count = db_activity.get(date_str, 0)
            
            weight = 0
            if capture_count == 0:
                weight = 0
            elif capture_count < 3:
                weight = 1
            elif capture_count < 10:
                weight = 2
            elif capture_count < 20:
                weight = 3
            else:
                weight = 4
                
            activity.append({
                "date": date_str,
                "count": weight
            })
            
        return {"activity": activity}
    except Exception as e:
        logger.error(f"Error generating activity heatmap: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/clusters")
async def get_concept_clusters():
    """
    Returns trending concept clusters from the database.
    """
    try:
        from app.core.database import get_domain_clusters
        db_clusters = await get_domain_clusters(8)
        
        clusters = []
        if db_clusters:
            max_count = max([c["count"] for c in db_clusters]) if db_clusters else 1
            
            for c in db_clusters:
                # Normalize weight between 20 and 95 for UI sizing
                weight = int((c["count"] / max_count) * 75) + 20
                clusters.append({"concept": c["domain"], "weight": weight})
            
        return {"clusters": clusters}
    except Exception as e:
        logger.error(f"Error fetching clusters: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/stats")
async def get_analytics_stats():
    """
    Returns real statistics for the user's graph captures.
    """
    try:
        from app.core.database import get_capture_stats
        stats = await get_capture_stats()
        return stats
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
async def export_data():
    """
    Exports the user's graph data (recent captures and metadata) as a JSON file.
    Falls back to DB if in-memory captures are empty.
    """
    import datetime
    try:
        global recent_captures
        export_list = recent_captures
        
        if not export_list and is_db_connected():
            logger.info("Hydrating export data from PostgreSQL...")
            export_list = await fetch_recent_captures(limit=1000) # Fetch more for export
            
        export_data = {
            "version": "1.0",
            "exported_at": datetime.datetime.utcnow().isoformat(),
            "memories_count": len(export_list),
            "memories": export_list
        }
        return export_data
    except Exception as e:
        logger.error(f"Error exporting data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/weekly-report")
async def get_weekly_report():
    """
    Generates a weekly summary report using Gemini based on recent captures.
    """
    try:
        global recent_captures
        
        if not recent_captures:
            return {"report": "You haven't captured any context yet. Start browsing with Kyro to generate insights!"}
            
        # Prepare context data
        context_str = "Recent User Activity:\n"
        for cap in recent_captures[:20]: # Limit to top 20 for token constraints
            context_str += f"- [{cap.get('type')}] {cap.get('title')}: {cap.get('text', '')[:200]}...\n"
            
        prompt = f"""You are Kyro, an executive AI assistant. Analyze the user's recent contextual activity and generate a concise, highly-structured "Weekly Insights Report". 
Format the response strictly in Markdown with these sections:
1. **Executive Summary** (2-3 sentences summarizing their main focus).
2. **Key Learnings** (3 bullet points of specific things they researched/read).
3. **Actionable Follow-ups** (2 suggestions on what they might want to do next based on the data).

Here is the raw data:
{context_str}
"""
        
        # We use the globally configured model from the top of the file
        response = await model.generate_content_async(prompt)
        report_text = response.text
        
        return {"report": report_text}
        
    except Exception as e:
        logger.error(f"Error generating weekly report: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class ConfigKeyRequest(BaseModel):
    key: str

@router.post("/config/key")
async def save_api_key(req: ConfigKeyRequest):
    """
    Saves the provided API key to the .env file.
    """
    try:
        import os
        
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        
        # Read existing .env
        env_content = []
        key_found = False
        
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                env_content = f.readlines()
                
        # Update or append GEMINI_API_KEY
        for i, line in enumerate(env_content):
            if line.startswith("GEMINI_API_KEY="):
                env_content[i] = f"GEMINI_API_KEY={req.key}\n"
                key_found = True
                break
                
        if not key_found:
            if env_content and not env_content[-1].endswith("\n"):
                env_content.append("\n")
            env_content.append(f"GEMINI_API_KEY={req.key}\n")
            
        with open(env_path, "w") as f:
            f.writelines(env_content)
            
        # Update current process env
        os.environ["GEMINI_API_KEY"] = req.key
        
        # Dynamically reconfigure the Gemini module so it works immediately
        import google.generativeai as genai
        genai.configure(api_key=req.key)
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Failed to save API key: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/data/wipe")
async def wipe_brain_memory():
    """
    Clears the kyro_captures SQLite database.
    """
    try:
        from app.core.database import wipe_database
        success = await wipe_database()
        if success:
            global recent_captures
            recent_captures.clear()
            return {"status": "success", "message": "Brain memory wiped successfully."}
        else:
            raise Exception("Failed to execute wipe operation.")
    except Exception as e:
        logger.error(f"Failed to wipe brain memory: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# In-memory config storage for extension preferences (Hackathon MVP)
extension_config = {
    "threshold": 100,
    "autoCapture": True
}

class ExtensionConfigRequest(BaseModel):
    threshold: int = None
    autoCapture: bool = None

@router.get("/config/extension")
async def get_extension_config():
    return extension_config

@router.post("/config/extension")
async def save_extension_config(req: ExtensionConfigRequest):
    try:
        if req.threshold is not None:
            extension_config["threshold"] = req.threshold
        if req.autoCapture is not None:
            extension_config["autoCapture"] = req.autoCapture
        return {"status": "success", "config": extension_config}
    except Exception as e:
        logger.error(f"Failed to save extension config: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
