from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from app.api.endpoints import router as api_router
from app.services.memory_service import setup_cognee

@asynccontextmanager
async def lifespan(app: FastAPI):
    await setup_cognee()
    print("Kyro Backend Started. Cognee Memory System Initialized.")
    yield
    print("Kyro Backend Shutdown.")

app = FastAPI(
    title="Kyro AI Backend",
    description="Backend for Kyro: Your AI That Never Forgets",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow connections from Browser Extension and Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to extension ID and frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kyro-backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
