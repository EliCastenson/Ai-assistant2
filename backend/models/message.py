from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class MessageType(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(MessageType), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Optional metadata
    session_id = Column(String, nullable=True)  # Group related messages
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    
    # AI processing info
    tokens_used = Column(Integer, nullable=True)
    model_used = Column(String, nullable=True)
    processing_time = Column(Integer, nullable=True)  # in milliseconds