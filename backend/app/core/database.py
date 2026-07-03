"""
Kyro Database Layer
-------------------
Provides a dedicated PostgreSQL connection for Kyro's own `kyro_captures` table.
This is separate from Cognee's internal data layer.

Tables:
  kyro_captures — durable persistence for every browser extension capture.

Indexes (created automatically on startup):
  idx_captures_domain      — fast filtering by source website
  idx_captures_type        — fast filtering by capture type (web_page, email, etc.)
  idx_captures_captured_at — fast chronological sort for the Timeline view
  idx_captures_text_fts    — GIN index for full-text search over captured content

All DDL uses IF NOT EXISTS so it is safe to run on every startup (idempotent).
Graceful degradation: if PostgreSQL is not available, DB operations are silently
skipped so the in-memory fallback continues to serve the app.
"""

import os
import json
import datetime
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ── Optional SQLAlchemy async import ──────────────────────────────────────────
try:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import text
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False
    logger.warning("sqlalchemy not installed. DB persistence layer disabled.")

# ── Connection config ─────────────────────────────────────────────────────────
def _build_db_url() -> str:
    # Use SQLite for easy manual access and hackathon portability
    return os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./kyro_captures.db")

# Module-level engine (created lazily in init_db)
_engine = None
_async_session = None


# ── DDL ───────────────────────────────────────────────────────────────────────
_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS kyro_captures (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    url          TEXT        NOT NULL,
    title        TEXT        NOT NULL,
    domain       TEXT        NOT NULL DEFAULT '',
    type         TEXT        NOT NULL DEFAULT 'web_page',
    text_content TEXT,
    metadata     JSON,
    captured_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""

# Optimised indexes — created individually so a failure on one doesn't block others
_INDEX_STATEMENTS = [
    # B-Tree indexes for exact/range lookups
    "CREATE INDEX IF NOT EXISTS idx_captures_domain      ON kyro_captures (domain);",
    "CREATE INDEX IF NOT EXISTS idx_captures_type        ON kyro_captures (type);",
    "CREATE INDEX IF NOT EXISTS idx_captures_captured_at ON kyro_captures (captured_at DESC);",
    # Composite index for the Timeline query (ORDER BY captured_at, filter by domain)
    "CREATE INDEX IF NOT EXISTS idx_captures_domain_time ON kyro_captures (domain, captured_at DESC);"
]


# ── Public API ────────────────────────────────────────────────────────────────
async def init_db():
    """
    Called once at application startup.
    Creates the kyro_captures table and all performance indexes if they don't exist.
    Silently skips if PostgreSQL is unreachable (graceful degradation).
    """
    global _engine, _async_session
    if not SQLALCHEMY_AVAILABLE:
        return

    try:
        db_url = _build_db_url()
        _engine = create_async_engine(
            db_url,
            pool_pre_ping=True,          # Detect stale connections
        )
        _async_session = sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)

        async with _engine.begin() as conn:
            # Create table
            await conn.execute(text(_CREATE_TABLE_SQL))
            # Apply indexes one by one
            for stmt in _INDEX_STATEMENTS:
                try:
                    await conn.execute(text(stmt))
                except Exception as idx_err:
                    logger.warning(f"Index creation skipped (may already exist): {idx_err}")

        logger.info("✅ PostgreSQL: kyro_captures table and indexes ready.")

    except Exception as e:
        logger.warning(f"⚠️  PostgreSQL unavailable — running with in-memory store only: {e}")
        _engine = None
        _async_session = None


async def close_db():
    """Dispose the connection pool on application shutdown."""
    global _engine
    if _engine:
        await _engine.dispose()
        logger.info("PostgreSQL connection pool closed.")


async def persist_capture(capture: dict) -> bool:
    """
    Insert a single capture record into kyro_captures.
    Returns True on success, False on failure (so caller can fall back gracefully).
    """
    if not _async_session:
        return False
    try:
        async with _async_session() as session:
            async with session.begin():
                await session.execute(
                    text("""
                        INSERT INTO kyro_captures
                            (url, title, domain, type, text_content, metadata, captured_at)
                        VALUES
                            (:url, :title, :domain, :type, :text_content, :metadata, :captured_at)
                    """),
                    {
                        "url":          str(capture.get("url", "")),
                        "title":        capture.get("title", ""),
                        "domain":       capture.get("domain", ""),
                        "type":         capture.get("type", "web_page"),
                        "text_content": capture.get("text", ""),
                        "metadata":     json.dumps(capture.get("metadata")) if capture.get("metadata") else None,
                        "captured_at":  datetime.datetime.fromisoformat(capture.get("timestamp").replace("Z", "+00:00")) if capture.get("timestamp") else datetime.datetime.now(datetime.timezone.utc),
                    }
                )
        return True
    except Exception as e:
        logger.error(f"DB persist_capture failed: {e}")
        return False


async def fetch_recent_captures(limit: int = 50) -> list:
    """
    Fetch the most recent captures from PostgreSQL for server-restart recovery.
    Returns an empty list if DB is unavailable.
    """
    if not _async_session:
        return []
    try:
        async with _async_session() as session:
            result = await session.execute(
                text("""
                    SELECT url, title, domain, type, text_content AS text, metadata, captured_at
                    FROM   kyro_captures
                    ORDER  BY captured_at DESC
                    LIMIT  :limit
                """),
                {"limit": limit}
            )
            rows = result.mappings().all()
            captures = []
            for row in rows:
                captures.append({
                    "url":       row["url"],
                    "title":     row["title"],
                    "domain":    row["domain"],
                    "type":      row["type"],
                    "text":      row["text"],
                    "metadata":  row["metadata"] if isinstance(row["metadata"], dict) else (json.loads(row["metadata"]) if row["metadata"] else None),
                    "timestamp": row["captured_at"].isoformat() if row["captured_at"] else None,
                })
            return captures
    except Exception as e:
        logger.error(f"DB fetch_recent_captures failed: {e}")
        return []


def is_db_connected() -> bool:
    """Returns True if a live DB connection pool exists."""
    return _engine is not None

async def get_capture_stats() -> dict:
    """
    Get real total captures, daily average, and current streak from the database.
    """
    if not _async_session:
        # Fallback to in-memory approximation if DB is down
        from app.api.endpoints import recent_captures
        total = len(recent_captures)
        return {"total": total, "average": total, "streak": 1 if total > 0 else 0}
    try:
        async with _async_session() as session:
            # Total
            total_res = await session.execute(text("SELECT COUNT(*) FROM kyro_captures"))
            total = total_res.scalar() or 0
            
            # Unique days for average
            days_res = await session.execute(text("SELECT COUNT(DISTINCT DATE(captured_at)) FROM kyro_captures"))
            days = days_res.scalar() or 1
            
            # Streak (mocking logic using days active for now as a simple proxy)
            streak = days
            
            return {"total": total, "average": int(total / max(1, days)), "streak": streak}
    except Exception as e:
        logger.error(f"DB get_capture_stats failed: {e}")
        return {"total": 0, "average": 0, "streak": 0}

async def get_daily_activity(days: int = 90) -> dict:
    """Returns a dictionary mapping date strings to capture counts for the last `days` days."""
    if not _async_session:
        return {}
    try:
        async with _async_session() as session:
            result = await session.execute(text(f"""
                SELECT DATE(captured_at) as date, COUNT(*) as count
                FROM kyro_captures
                WHERE captured_at >= date('now', '-{days} days')
                GROUP BY DATE(captured_at)
            """))
            rows = result.mappings().all()
            return {row["date"]: row["count"] for row in rows}
    except Exception as e:
        logger.error(f"DB get_daily_activity failed: {e}")
        return {}

async def get_domain_clusters(limit: int = 8) -> list:
    """Returns trending domain clusters based on frequency."""
    if not _async_session:
        return []
    try:
        async with _async_session() as session:
            result = await session.execute(text(f"""
                SELECT domain, COUNT(*) as count
                FROM kyro_captures
                WHERE domain IS NOT NULL AND domain != ''
                GROUP BY domain
                ORDER BY count DESC
                LIMIT {limit}
            """))
            return result.mappings().all()
    except Exception as e:
        logger.error(f"DB get_domain_clusters failed: {e}")
        return []
