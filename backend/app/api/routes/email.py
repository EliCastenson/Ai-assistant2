from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ...core.database import get_db
from ...models.email_message import EmailMessage, EmailMessageCreate, EmailMessageResponse

router = APIRouter(prefix="/email", tags=["email"])

@router.get("/", response_model=List[EmailMessageResponse])
async def get_email_messages(
    skip: int = 0,
    limit: int = 100,
    is_read: bool = None,
    is_important: bool = None,
    db: Session = Depends(get_db)
):
    """Get email messages with optional filtering"""
    query = db.query(EmailMessage)
    
    if is_read is not None:
        query = query.filter(EmailMessage.is_read == is_read)
    if is_important is not None:
        query = query.filter(EmailMessage.is_important == is_important)
    
    # Order by received_at descending (newest first)
    emails = query.order_by(EmailMessage.received_at.desc()).offset(skip).limit(limit).all()
    return emails

@router.post("/", response_model=EmailMessageResponse)
async def create_email_message(
    email: EmailMessageCreate,
    db: Session = Depends(get_db)
):
    """Create a new email message"""
    db_email = EmailMessage(**email.dict())
    db.add(db_email)
    db.commit()
    db.refresh(db_email)
    return db_email

@router.get("/{email_id}", response_model=EmailMessageResponse)
async def get_email_message(
    email_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific email message by ID"""
    email = db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
    if email is None:
        raise HTTPException(status_code=404, detail="Email message not found")
    return email

@router.patch("/{email_id}/read", response_model=EmailMessageResponse)
async def mark_email_as_read(
    email_id: int,
    db: Session = Depends(get_db)
):
    """Mark an email as read"""
    email = db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
    if email is None:
        raise HTTPException(status_code=404, detail="Email message not found")
    
    email.is_read = True
    db.commit()
    db.refresh(email)
    return email

@router.patch("/{email_id}/important", response_model=EmailMessageResponse)
async def toggle_email_importance(
    email_id: int,
    db: Session = Depends(get_db)
):
    """Toggle email importance status"""
    email = db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
    if email is None:
        raise HTTPException(status_code=404, detail="Email message not found")
    
    email.is_important = not email.is_important
    db.commit()
    db.refresh(email)
    return email

@router.delete("/{email_id}")
async def delete_email_message(
    email_id: int,
    db: Session = Depends(get_db)
):
    """Delete an email message"""
    email = db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
    if email is None:
        raise HTTPException(status_code=404, detail="Email message not found")
    
    db.delete(email)
    db.commit()
    return {"message": "Email message deleted successfully"}