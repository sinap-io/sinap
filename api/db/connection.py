from pathlib import Path

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings

# api/.env — resuelto relativo a este archivo (api/db/connection.py → api/)
_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    database_url: str
    anthropic_api_key: str
    allowed_origins: str = "http://localhost:3000"

    model_config = {"env_file": str(_ENV_FILE)}


settings = Settings()

engine = create_async_engine(
    settings.database_url,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
