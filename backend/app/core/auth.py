"""
Kyro Auth Middleware
--------------------
Validates Clerk JWTs from incoming requests and extracts the user_id (Clerk 'sub' claim).

Usage:
    from app.core.auth import get_optional_user, get_required_user

    # Optional: Returns None if no token is present (backward-compat with local dev)
    @router.get("/recent")
    async def get_recent(user_id: str | None = Depends(get_optional_user)):
        ...

    # Required: Raises 401 if no valid token
    @router.post("/capture")
    async def capture(user_id: str = Depends(get_required_user)):
        ...

Environment Variables Required:
    CLERK_PEM_PUBLIC_KEY  — The RSA public key from your Clerk Dashboard
                            (Clerk > API Keys > PEM Public Key, starts with '-----BEGIN PUBLIC KEY-----')
    ENABLE_AUTH           — Set to "true" to enforce JWT validation.
                            Defaults to "false" for local development.
"""

import os
import logging
from typing import Optional

from fastapi import Request, HTTPException

logger = logging.getLogger(__name__)

# Whether auth enforcement is active. Defaults OFF for local dev.
_AUTH_ENABLED = os.getenv("ENABLE_AUTH", "false").lower() == "true"
_CLERK_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY", "")


def _decode_clerk_jwt(token: str) -> dict:
    """
    Decode and verify a Clerk-issued JWT using the PEM public key.
    Raises ValueError on any validation failure.
    """
    try:
        from jose import jwt, JWTError
    except ImportError:
        raise RuntimeError(
            "python-jose is required for JWT validation. "
            "Install it with: pip install python-jose[cryptography]"
        )

    if not _CLERK_PUBLIC_KEY:
        raise ValueError("CLERK_PEM_PUBLIC_KEY environment variable is not set.")

    try:
        payload = jwt.decode(
            token,
            _CLERK_PUBLIC_KEY,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk JWTs don't use 'aud' by default
        )
        return payload
    except JWTError as e:
        raise ValueError(f"JWT validation failed: {e}")


async def get_optional_user(request: Request) -> Optional[str]:
    """
    FastAPI dependency that extracts the Clerk user_id from a Bearer token.
    Returns None if:
    - ENABLE_AUTH is not "true" (local dev mode), OR
    - No Authorization header is present.
    Raises 401 if a token is present but invalid.
    """
    if not _AUTH_ENABLED:
        return None  # Auth disabled — single-user local mode

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None  # No token — treat as anonymous / single-user

    token = auth_header.split(" ", 1)[1]
    try:
        payload = _decode_clerk_jwt(token)
        return payload.get("sub")  # 'sub' is the Clerk user_id
    except (ValueError, RuntimeError) as e:
        logger.warning(f"Auth token validation failed: {e}")
        raise HTTPException(status_code=401, detail=str(e))


async def get_required_user(request: Request) -> str:
    """
    FastAPI dependency that REQUIRES a valid Clerk JWT.
    Raises 401 if auth is enabled and no valid token is found.
    In local dev mode (ENABLE_AUTH=false), returns a constant placeholder user_id.
    """
    if not _AUTH_ENABLED:
        return "local_dev_user"  # Single-user local mode

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization Bearer token.")

    token = auth_header.split(" ", 1)[1]
    try:
        payload = _decode_clerk_jwt(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token is missing 'sub' claim.")
        return user_id
    except (ValueError, RuntimeError) as e:
        logger.warning(f"Required auth failed: {e}")
        raise HTTPException(status_code=401, detail=str(e))
