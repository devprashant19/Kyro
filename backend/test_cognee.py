import cognee
import asyncio
from cognee.infrastructure.databases.graph import get_graph_engine

async def test():
    try:
        engine = await get_graph_engine()
        print(dir(engine))
        if hasattr(engine, "get_graph_data"):
            data = await engine.get_graph_data()
            print("Graph Data:", data)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
