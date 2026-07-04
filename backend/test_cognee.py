import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

from services.memory_service import setup_cognee, add_memory, search_memories

async def test_cloud_integration():
    print("Testing Cognee Cloud API integration...")
    await setup_cognee()
    
    import uuid
    test_text = f"The user is testing the new Cognee Cloud REST API. Unique ID: {uuid.uuid4()}"
    
    print("Adding memory to Cognee Cloud...")
    # add_memory handles both adding and cognifying
    await add_memory({"text": test_text, "title": "API Test", "url": "localhost"})
    
    print("Search test...")
    results = await search_memories("What is the user testing?")
    for r in results:
        print(r)

if __name__ == "__main__":
    asyncio.run(test_cloud_integration())
