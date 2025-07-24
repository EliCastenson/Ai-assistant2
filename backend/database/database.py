from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from pathlib import Path

# Create data directory if it doesn't exist
DATA_DIR = Path.home() / ".ai_assistant"
DATA_DIR.mkdir(exist_ok=True)

# Database URL for local SQLite
DATABASE_URL = f"sqlite+aiosqlite:///{DATA_DIR}/assistant.db"

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    connect_args={"check_same_thread": False}
)

# Create session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
class Base(DeclarativeBase):
    pass

# Dependency to get database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Initialize database
async def init_db():
    from models import user, task, message, google_token, notification
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)