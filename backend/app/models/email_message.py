from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

Base = declarative_base()

class EmailMessage(Base):
    __tablename__ = "email_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255), nullable=False)
    sender = Column(String(255), nullable=False)
    recipient = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)
    received_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmailMessageCreate(BaseModel):
    subject: str
    sender: str
    recipient: str
    body: str
    is_important: bool = False
    received_at: datetime

class EmailMessageResponse(BaseModel):
    id: int
    subject: str
    sender: str
    recipient: str
    body: str
    is_read: bool
    is_important: bool
    received_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True