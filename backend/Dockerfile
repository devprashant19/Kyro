FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements if they existed (we'll just copy everything for MVP)
COPY . /app

# Install Python dependencies
# Since we don't have a requirements.txt yet, we'll install them manually
RUN pip install --no-cache-dir fastapi uvicorn pydantic cognee google-generativeai python-dotenv psycopg2-binary asyncpg sqlalchemy pgvector "redis[asyncio]"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
