from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class NotificationType(str, enum.Enum):
    TASK_REMINDER = "task_reminder"
    EVENT_REMINDER = "event_reminder"
    EMAIL_SUMMARY = "email_summary"
    AI_SUGGESTION = "ai_suggestion"
    SYSTEM = "system"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    READ = "read"
    DISMISSED = "dismissed"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Related entity info
    related_task_id = Column(Integer, nullable=True)
    related_event_id = Column(String, nullable=True)  # Google Calendar event ID
    action_url = Column(String, nullable=True)  # URL for notification action