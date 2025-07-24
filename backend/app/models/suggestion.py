from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

Base = declarative_base()

class Suggestion(Base):
    __tablename__ = "suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    action_type = Column(String(100), nullable=False)  # task, calendar, email, etc.
    action_data = Column(Text, nullable=True)  # JSON string
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SuggestionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    action_type: str
    action_data: Optional[str] = None

class SuggestionResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    action_type: str
    action_data: Optional[str]
    is_dismissed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True