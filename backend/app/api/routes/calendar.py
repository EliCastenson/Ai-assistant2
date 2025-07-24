from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date

from ...core.database import get_db
from ...models.calendar_event import CalendarEvent, CalendarEventCreate, CalendarEventResponse

router = APIRouter(prefix="/calendar", tags=["calendar"])

@router.get("/", response_model=List[CalendarEventResponse])
async def get_calendar_events(
    skip: int = 0,
    limit: int = 100,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db)
):
    """Get calendar events with optional date filtering"""
    query = db.query(CalendarEvent)
    
    if start_date:
        query = query.filter(CalendarEvent.start_time >= start_date)
    if end_date:
        query = query.filter(CalendarEvent.end_time <= end_date)
    
    events = query.offset(skip).limit(limit).all()
    return events

@router.post("/", response_model=CalendarEventResponse)
async def create_calendar_event(
    event: CalendarEventCreate,
    db: Session = Depends(get_db)
):
    """Create a new calendar event"""
    db_event = CalendarEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/{event_id}", response_model=CalendarEventResponse)
async def get_calendar_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific calendar event by ID"""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return event

@router.put("/{event_id}", response_model=CalendarEventResponse)
async def update_calendar_event(
    event_id: int,
    event_update: CalendarEventCreate,
    db: Session = Depends(get_db)
):
    """Update a calendar event"""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    for key, value in event_update.dict(exclude_unset=True).items():
        setattr(event, key, value)
    event.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}")
async def delete_calendar_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Delete a calendar event"""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    db.delete(event)
    db.commit()
    return {"message": "Calendar event deleted successfully"}