import os
from dotenv import load_dotenv
import cognee
import asyncio

load_dotenv()

async def setup_cognee():
    """Initialize Cognee with Gemini LLM provider"""
    # Note: Currently assumes Gemini API key is in environment variables.
    cognee.config.set_llm_provider("gemini")
    cognee.config.set_llm_model("gemini-1.5-pro")
    
    # We use local LanceDB/NetworkX by default in Cognee for MVP
    # Later we can configure PostgreSQL here.
    
    # Ensure system is ready
    await cognee.prune.prune_system(metadata=True)
    print("Cognee Initialized with Gemini")

async def add_memory(context_data: dict):
    """
    Ingest text into Cognee to build the knowledge graph.
    """
    text = context_data.get("text", "")
    url = context_data.get("url", "")
    title = context_data.get("title", "")
    
    if not text:
        text = f"Visited: {title} at {url}"
        
    dataset_name = f"kyro_memories"
    
    # Add to cognee memory graph
    await cognee.add(text, dataset_name=dataset_name)
    
    # Trigger cognitify to process added information into graph
    await cognee.cognitify()
    
    return True

async def search_memories(query: str):
    """
    Search the graph using Cognee.
    """
    search_results = await cognee.search(query, search_type="SUMMARY")
    return search_results

async def get_graph_data():
    """
    Retrieve nodes and edges from Cognee's internal graph representation.
    """
    try:
        from cognee.infrastructure.databases.graph import get_graph_engine
        engine = await get_graph_engine()
        
        if hasattr(engine, "get_graph_data"):
            nodes, edges = await engine.get_graph_data()
            return {"nodes": nodes, "edges": edges}
        
        return None
    except Exception as e:
        print(f"Error extracting graph data from Cognee: {e}")
        return None
async def prune_stale_memories():
    """
    Scans the graph for duplicate nodes (based on exact label/content matches)
    and removes the stale copies to save space and improve context relevance.
    """
    try:
        from cognee.infrastructure.databases.graph import get_graph_engine
        engine = await get_graph_engine()
        
        if not hasattr(engine, "get_graph_data") or not hasattr(engine, "delete_node"):
            return {"status": "skipped", "message": "Graph engine does not support direct pruning."}
            
        nodes, edges = await engine.get_graph_data()
        if not nodes:
            return {"status": "success", "message": "Graph is empty, nothing to prune.", "pruned_count": 0}
            
        seen_labels = set()
        duplicates_to_delete = []
        
        for node in nodes:
            node_id = node.get("id") if isinstance(node, dict) else (node[0] if isinstance(node, tuple) else None)
            label = node.get("id") if isinstance(node, dict) else (node[0] if isinstance(node, tuple) else None)
            
            if not node_id or not label:
                continue
                
            label_str = str(label).strip().lower()
            
            if label_str in seen_labels:
                duplicates_to_delete.append(node_id)
            else:
                seen_labels.add(label_str)
                
        # Delete the identified duplicates
        for node_id in duplicates_to_delete:
            try:
                await engine.delete_node(node_id)
                print(f"Pruned duplicate node: {node_id}")
            except Exception as e:
                print(f"Failed to delete node {node_id}: {e}")
                
        return {
            "status": "success", 
            "message": f"Successfully pruned {len(duplicates_to_delete)} duplicate memory nodes.",
            "pruned_count": len(duplicates_to_delete)
        }
    except Exception as e:
        print(f"Error during graph pruning: {e}")
        return {"status": "error", "message": str(e), "pruned_count": 0}
