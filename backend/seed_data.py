#!/usr/bin/env python3
"""
Seed script to populate the database with sample data
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal, create_tables
from app.models.task import Task
from app.models.calendar_event import CalendarEvent
from app.models.email_message import EmailMessage

def seed_database():
    # Create tables
    create_tables()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(Task).delete()
        db.query(CalendarEvent).delete()
        db.query(EmailMessage).delete()
        
        # Seed tasks
        tasks = [
            Task(
                title="Complete project proposal",
                description="Write and submit the Q1 project proposal for the new AI features",
                priority="high",
                due_date=datetime.now() + timedelta(days=2),
                completed=False
            ),
            Task(
                title="Review code changes",
                description="Review the pull request for the authentication system updates",
                priority="medium", 
                due_date=datetime.now() + timedelta(days=1),
                completed=False
            ),
            Task(
                title="Schedule team meeting",
                description="Organize the weekly team sync for next Monday",
                priority="medium",
                due_date=datetime.now() + timedelta(days=3),
                completed=True
            ),
            Task(
                title="Update documentation",
                description="Update the API documentation with the latest endpoint changes",
                priority="low",
                due_date=datetime.now() + timedelta(days=5),
                completed=False
            ),
            Task(
                title="Backup database",
                description="Create a backup of the production database",
                priority="high",
                due_date=datetime.now() + timedelta(hours=6),
                completed=False
            )
        ]
        
        for task in tasks:
            db.add(task)
        
        # Seed calendar events
        events = [
            CalendarEvent(
                title="Team Standup",
                description="Daily team standup meeting",
                start_time=datetime.now() + timedelta(hours=2),
                end_time=datetime.now() + timedelta(hours=2, minutes=30),
                location="Conference Room A"
            ),
            CalendarEvent(
                title="Client Presentation",
                description="Present the Q4 roadmap to the client",
                start_time=datetime.now() + timedelta(days=1, hours=10),
                end_time=datetime.now() + timedelta(days=1, hours=11),
                location="Main Conference Room",
                attendees='["john@company.com", "sarah@company.com", "client@example.com"]'
            ),
            CalendarEvent(
                title="Code Review Session",
                description="Review the new authentication system implementation",
                start_time=datetime.now() + timedelta(days=2, hours=14),
                end_time=datetime.now() + timedelta(days=2, hours=15, minutes=30),
                location="Development Lab"
            ),
            CalendarEvent(
                title="One-on-One with Manager",
                description="Weekly check-in with direct manager",
                start_time=datetime.now() + timedelta(days=3, hours=15),
                end_time=datetime.now() + timedelta(days=3, hours=15, minutes=45),
                location="Manager's Office"
            ),
            CalendarEvent(
                title="Product Launch Meeting",
                description="Discuss the upcoming product launch strategy",
                start_time=datetime.now() + timedelta(days=5, hours=9),
                end_time=datetime.now() + timedelta(days=5, hours=10, minutes=30),
                location="Boardroom",
                attendees='["product@company.com", "marketing@company.com", "engineering@company.com"]'
            )
        ]
        
        for event in events:
            db.add(event)
        
        # Seed emails
        emails = [
            EmailMessage(
                subject="Welcome to the team!",
                sender="hr@company.com",
                recipient="you@company.com",
                body="We're excited to have you join our team. Here's everything you need to know to get started...",
                is_read=False,
                is_important=True,
                received_at=datetime.now() - timedelta(hours=2)
            ),
            EmailMessage(
                subject="Project Update - Q4 Roadmap",
                sender="project-manager@company.com",
                recipient="you@company.com",
                body="Hi team,\n\nI wanted to provide an update on our Q4 roadmap. We've made significant progress on the AI features and are on track to meet our deadlines.\n\nKey accomplishments:\n- Authentication system completed\n- API endpoints finalized\n- UI components 80% complete\n\nUpcoming milestones:\n- User testing begins next week\n- Beta release scheduled for end of month\n\nPlease let me know if you have any questions.\n\nBest regards,\nProject Manager",
                is_read=True,
                is_important=False,
                received_at=datetime.now() - timedelta(hours=5)
            ),
            EmailMessage(
                subject="Code Review Required",
                sender="developer@company.com",
                recipient="you@company.com",
                body="Hi,\n\nI've submitted a pull request for the new authentication system. Could you please review it when you have a moment?\n\nPR Link: https://github.com/company/project/pull/123\n\nThe changes include:\n- JWT token implementation\n- Password encryption updates\n- Session management improvements\n\nThanks!",
                is_read=False,
                is_important=False,
                received_at=datetime.now() - timedelta(hours=1)
            ),
            EmailMessage(
                subject="Meeting Reminder: Client Presentation Tomorrow",
                sender="calendar@company.com",
                recipient="you@company.com",
                body="This is a reminder that you have the following meeting tomorrow:\n\nClient Presentation\nTime: 10:00 AM - 11:00 AM\nLocation: Main Conference Room\n\nAgenda:\n- Q4 Roadmap Overview\n- Feature Demonstrations\n- Timeline Discussion\n- Q&A Session\n\nPlease prepare your materials in advance.",
                is_read=False,
                is_important=True,
                received_at=datetime.now() - timedelta(minutes=30)
            ),
            EmailMessage(
                subject="Security Update Required",
                sender="security@company.com",
                recipient="you@company.com",
                body="Important Security Notice\n\nWe've identified a security update that needs to be applied to all development systems.\n\nPlease update your local development environment by running:\n\n$ git pull origin main\n$ npm install\n$ npm run security-update\n\nThis update addresses:\n- Dependency vulnerabilities\n- Authentication improvements\n- Data encryption enhancements\n\nIf you encounter any issues, please contact the security team immediately.\n\nThank you for your attention to this matter.",
                is_read=True,
                is_important=True,
                received_at=datetime.now() - timedelta(days=1, hours=3)
            )
        ]
        
        for email in emails:
            db.add(email)
        
        # Commit all changes
        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   - Added {len(tasks)} tasks")
        print(f"   - Added {len(events)} calendar events") 
        print(f"   - Added {len(emails)} emails")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()