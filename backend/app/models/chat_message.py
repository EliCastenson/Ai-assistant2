from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

Base = declarative_base()

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    role = Column(String(50), nullable=False)  # user, assistant, system
    thread_id = Column(String(255), nullable=True)
    is_ai_response = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessageCreate(BaseModel):
    content: str
    role: str
    thread_id: Optional[str] = None
    is_ai_response: bool = False

class ChatMessageResponse(BaseModel):
    id: int
    content: str
    role: str
    thread_id: Optional[str]
    is_ai_response: bool
    created_at: datetime
    
    class Config:
        from_attributes = True