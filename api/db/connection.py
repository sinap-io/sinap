from pathlib import Path

import asyncpg
from pydantic_settings import BaseSettings

# api/.env — resuelto relativo a este archivo (api/db/connection.py → api/)
_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    database_url: str
    anthropic_api_key: str
    allowed_origins: str = "http://localhost:3000"

    model_config = {"env_file": str(_ENV_FILE)}


settings = Settings()

# Pool global de conexiones asyncpg
_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        # Convertir URL de SQLAlchemy a formato asyncpg
        url = settings.database_url
        url = url.replace("postgresql+asyncpg://", "postgresql://")
        _pool = await asyncpg.create_pool(url, min_size=1, max_size=10)
    return _pool


async def get_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn
