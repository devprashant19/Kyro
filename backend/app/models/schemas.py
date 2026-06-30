from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class ContextCaptureRequest(BaseModel):
    url: str
    title: str
    domain: str
    timestamp: str
    type: Optional[str] = "page_view" # e.g., page_view, selection, conversation
    text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    project_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
    related_memories: List[dict] = []

class ApiKeyRequest(BaseModel):
    api_key: str
