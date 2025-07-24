from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Optional for Google OAuth
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Settings
    preferences = Column(JSON, default=dict)  # Store user preferences as JSON
    theme = Column(String, default="light")
    notifications_enabled = Column(Boolean, default=True)
    
    # Google OAuth info
    google_id = Column(String, unique=True, nullable=True)
    profile_picture = Column(String, nullable=True)