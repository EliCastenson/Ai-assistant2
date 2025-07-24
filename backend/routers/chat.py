from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import uuid

from database.database import get_db
from models.message import Message, MessageType
from models.user import User
from services.ai_service import AIService
from services.task_service import TaskService
from services.calendar_service import CalendarService
from services.email_service import EmailService

router = APIRouter()

class ChatMessage(BaseModel):
    content: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    type: str
    content: str
    timestamp: datetime
    suggestions: Optional[List[dict]] = None

class ChatHistory(BaseModel):
    messages: List[ChatResponse]
    total: int

@router.post("/send", response_model=ChatResponse)
async def send_message(
    message: ChatMessage,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Send a message to the AI assistant and get a response."""
    try:
        # For demo purposes, we'll use a default user
        # In production, this would come from authentication
        user_id = 1
        
        # Generate session ID if not provided
        session_id = message.session_id or str(uuid.uuid4())
        
        # Save user message
        user_msg = Message(
            user_id=user_id,
            type=MessageType.USER,
            content=message.content,
            session_id=session_id
        )
        db.add(user_msg)
        await db.commit()
        await db.refresh(user_msg)
        
        # Get AI response
        ai_service = AIService()
        ai_response = await ai_service.process_message(
            message.content,
            user_id,
            session_id,
            db
        )
        
        # Save assistant message
        assistant_msg = Message(
            user_id=user_id,
            type=MessageType.ASSISTANT,
            content=ai_response["content"],
            session_id=session_id,
            metadata=json.dumps({
                "suggestions": ai_response.get("suggestions", []),
                "actions": ai_response.get("actions", [])
            })
        )
        db.add(assistant_msg)
        await db.commit()
        await db.refresh(assistant_msg)
        
        # Process any background actions
        if ai_response.get("actions"):
            background_tasks.add_task(
                process_ai_actions,
                ai_response["actions"],
                user_id,
                db
            )
        
        return ChatResponse(
            id=str(assistant_msg.id),
            type="assistant",
            content=ai_response["content"],
            timestamp=assistant_msg.created_at,
            suggestions=ai_response.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/history", response_model=ChatHistory)
async def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get chat history for a user or session."""
    try:
        user_id = 1  # Default user for demo
        
        query = select(Message).where(Message.user_id == user_id)
        
        if session_id:
            query = query.where(Message.session_id == session_id)
            
        query = query.order_by(desc(Message.created_at)).limit(limit).offset(offset)
        
        result = await db.execute(query)
        messages = result.scalars().all()
        
        # Count total messages
        count_query = select(Message).where(Message.user_id == user_id)
        if session_id:
            count_query = count_query.where(Message.session_id == session_id)
        
        total_result = await db.execute(count_query)
        total = len(total_result.scalars().all())
        
        chat_messages = [
            ChatResponse(
                id=str(msg.id),
                type=msg.type.value,
                content=msg.content,
                timestamp=msg.created_at,
                suggestions=json.loads(msg.metadata or "{}").get("suggestions", []) if msg.metadata else []
            )
            for msg in reversed(messages)  # Reverse to show oldest first
        ]
        
        return ChatHistory(messages=chat_messages, total=total)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")

@router.delete("/history/{session_id}")
async def clear_session_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Clear chat history for a specific session."""
    try:
        user_id = 1  # Default user for demo
        
        # Delete messages for this session
        query = select(Message).where(
            Message.user_id == user_id,
            Message.session_id == session_id
        )
        result = await db.execute(query)
        messages = result.scalars().all()
        
        for message in messages:
            await db.delete(message)
        
        await db.commit()
        
        return {"message": f"Cleared {len(messages)} messages from session {session_id}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")

async def process_ai_actions(actions: List[dict], user_id: int, db: AsyncSession):
    """Process AI-suggested actions in the background."""
    try:
        task_service = TaskService()
        calendar_service = CalendarService()
        email_service = EmailService()
        
        for action in actions:
            action_type = action.get("type")
            
            if action_type == "create_task":
                await task_service.create_task_from_ai(action["data"], user_id, db)
            elif action_type == "create_event":
                await calendar_service.create_event_from_ai(action["data"], user_id, db)
            elif action_type == "send_email":
                await email_service.send_email_from_ai(action["data"], user_id, db)
                
    except Exception as e:
        print(f"Error processing AI actions: {e}")  # Log error but don't fail the request