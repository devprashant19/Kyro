import asyncio
from app.services.memory_service import add_memory, setup_cognee

async def seed():
    print("Setting up Cognee...")
    await setup_cognee()
    
    memories = [
        {"url": "https://reactflow.dev", "title": "React Flow Docs", "text": "React Flow is a highly customizable library for building node-based UIs, editors, flow charts and diagrams.", "domain": "reactflow.dev", "type": "Document"},
        {"url": "https://cognee.ai", "title": "Cognee AI", "text": "Cognee is a memory operating system that utilizes graph databases to manage AI context.", "domain": "cognee.ai", "type": "Concept"},
        {"url": "https://github.com/Kyro/core", "title": "Kyro Core Repo", "text": "The core repository for Kyro, an open-source Context OS.", "domain": "github.com", "type": "Repository"},
        {"url": "https://linkedin.com/in/puneet", "title": "Puneet Yadav", "text": "Puneet Yadav is the core developer behind Kyro AI, specializing in graph architecture.", "domain": "linkedin.com", "type": "Person"},
        {"url": "https://gemini.google.com", "title": "Gemini 1.5", "text": "Gemini 1.5 Pro is an advanced language model with a massive context window used for RAG applications.", "domain": "gemini.google.com", "type": "Concept"}
    ]
    
    for i, mem in enumerate(memories):
        print(f"Adding memory {i+1}/5: {mem['title']}")
        await add_memory(mem)
        
    print("Seeding complete! You should now see 5+ nodes in the graph.")

asyncio.run(seed())
