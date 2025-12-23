from config import settings
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine,async_sessionmaker,AsyncSession

engine = create_async_engine(
    url=settings.POSTGRES_URL,
    echo = True,
)

async_session = async_sessionmaker(
    bind= engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_session()->AsyncGenerator[AsyncSession,None]:
    async with async_session() as session:
        yield session
    
    