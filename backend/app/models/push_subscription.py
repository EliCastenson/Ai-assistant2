from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel

Base = declarative_base()

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(Text, nullable=False)
    keys = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: str

class PushSubscriptionResponse(BaseModel):
    id: int
    endpoint: str
    keys: str
    created_at: datetime
    
    class Config:
        from_attributes = True