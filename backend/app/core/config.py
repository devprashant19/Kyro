import os
from pydantic_settings import BaseSettings
from typing import Optional

# Get the absolute path to the Kyro/ root directory
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
ENV_PATH = os.path.join(ROOT_DIR, ".env")

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "Kyro OS"
    DEBUG_MODE: bool = False
    
    # Sentry
    SENTRY_DSN: Optional[str] = None
    
    # AI Models
    GEMINI_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-1.5-pro"
    
    # Database Config
    DB_PROVIDER: str = "sqlite"
    VECTOR_DB_PROVIDER: str = "lancedb"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "cognee_db"
    DB_USERNAME: str = "cognee"
    DB_PASSWORD: str = "cognee"
    
    class Config:
        env_file = ENV_PATH
        case_sensitive = True
        extra = "ignore"

settings = Settings()
