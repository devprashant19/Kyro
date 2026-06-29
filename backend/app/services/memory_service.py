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
    Note: Requires direct access to the graph engine used by cognee.
    """
    # For MVP we will simulate graph data until we write custom networkx extractors
    return None
