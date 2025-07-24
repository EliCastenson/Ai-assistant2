import openai
import os
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.task import Task, TaskPriority, TaskStatus
from models.message import Message, MessageType
from services.search_service import SearchService

class AIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.search_service = SearchService()
        
    async def process_message(
        self,
        message: str,
        user_id: int,
        session_id: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Process a user message and return AI response with suggestions and actions."""
        
        try:
            # Get conversation context
            context = await self._get_conversation_context(user_id, session_id, db)
            
            # Analyze intent
            intent = await self._analyze_intent(message)
            
            # Generate response based on intent
            if intent["type"] == "task_management":
                return await self._handle_task_intent(message, intent, user_id, db)
            elif intent["type"] == "calendar_management":
                return await self._handle_calendar_intent(message, intent, user_id, db)
            elif intent["type"] == "email_management":
                return await self._handle_email_intent(message, intent, user_id, db)
            elif intent["type"] == "search_query":
                return await self._handle_search_intent(message, intent)
            else:
                return await self._handle_general_conversation(message, context)
                
        except Exception as e:
            return {
                "content": f"I apologize, but I encountered an error processing your request: {str(e)}. Please try again.",
                "suggestions": [],
                "actions": []
            }
    
    async def _analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze user message to determine intent and extract parameters."""
        
        system_prompt = """
        You are an AI assistant that analyzes user messages to determine their intent. 
        Classify the message into one of these categories:
        - task_management: Creating, updating, or managing tasks
        - calendar_management: Scheduling events, checking calendar
        - email_management: Reading, composing, or managing emails
        - search_query: Looking up information
        - general_conversation: General chat or questions
        
        Return a JSON object with:
        {
            "type": "category",
            "confidence": 0.0-1.0,
            "parameters": {
                "action": "create/update/delete/list",
                "entities": ["extracted", "entities"],
                "priority": "low/medium/high/urgent",
                "due_date": "extracted date if any",
                "title": "extracted title/subject",
                "description": "extracted description"
            }
        }
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            intent_json = response.choices[0].message.content
            return json.loads(intent_json)
            
        except Exception as e:
            # Fallback to simple keyword matching
            return self._fallback_intent_analysis(message)
    
    def _fallback_intent_analysis(self, message: str) -> Dict[str, Any]:
        """Fallback intent analysis using keyword matching."""
        message_lower = message.lower()
        
        # Task keywords
        task_keywords = ["task", "todo", "remind", "complete", "finish", "do"]
        calendar_keywords = ["meeting", "event", "schedule", "calendar", "appointment"]
        email_keywords = ["email", "mail", "send", "reply", "compose"]
        search_keywords = ["search", "find", "look up", "what is", "tell me about"]
        
        if any(keyword in message_lower for keyword in task_keywords):
            return {"type": "task_management", "confidence": 0.7, "parameters": {}}
        elif any(keyword in message_lower for keyword in calendar_keywords):
            return {"type": "calendar_management", "confidence": 0.7, "parameters": {}}
        elif any(keyword in message_lower for keyword in email_keywords):
            return {"type": "email_management", "confidence": 0.7, "parameters": {}}
        elif any(keyword in message_lower for keyword in search_keywords):
            return {"type": "search_query", "confidence": 0.7, "parameters": {}}
        else:
            return {"type": "general_conversation", "confidence": 0.5, "parameters": {}}
    
    async def _handle_task_intent(
        self,
        message: str,
        intent: Dict[str, Any],
        user_id: int,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle task-related requests."""
        
        # Get current tasks for context
        tasks_query = select(Task).where(
            Task.user_id == user_id,
            Task.status != TaskStatus.COMPLETED
        ).limit(5)
        result = await db.execute(tasks_query)
        current_tasks = result.scalars().all()
        
        task_context = "\n".join([
            f"- {task.title} (Priority: {task.priority.value}, Due: {task.due_date})"
            for task in current_tasks
        ]) if current_tasks else "No current tasks."
        
        system_prompt = f"""
        You are a productivity assistant helping with task management.
        
        Current tasks:
        {task_context}
        
        Based on the user's message, provide a helpful response and suggest actions.
        If the user wants to create a task, extract the details and include a "create_task" action.
        
        Return JSON with:
        {{
            "content": "Your response to the user",
            "suggestions": [
                {{"title": "Suggestion", "action": "action_description"}},
            ],
            "actions": [
                {{
                    "type": "create_task",
                    "data": {{
                        "title": "Task title",
                        "description": "Task description",
                        "priority": "medium",
                        "due_date": "2024-01-01T10:00:00Z"
                    }}
                }}
            ]
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            return {
                "content": "I can help you manage your tasks. You can ask me to create new tasks, update existing ones, or check your task list. What would you like to do?",
                "suggestions": [
                    {"title": "Create a new task", "action": "Create a task to review quarterly reports"},
                    {"title": "List current tasks", "action": "Show me my current tasks"},
                    {"title": "Mark task complete", "action": "Mark my first task as complete"}
                ],
                "actions": []
            }
    
    async def _handle_calendar_intent(
        self,
        message: str,
        intent: Dict[str, Any],
        user_id: int,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle calendar-related requests."""
        
        system_prompt = """
        You are a calendar assistant. Help the user with scheduling and calendar management.
        
        Based on the user's message, provide a helpful response and suggest actions.
        If they want to create an event, extract the details.
        
        Return JSON with content, suggestions, and actions.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            return {
                "content": "I can help you manage your calendar. You can ask me to schedule meetings, check your upcoming events, or create reminders. To get started, you'll need to connect your Google Calendar.",
                "suggestions": [
                    {"title": "Connect Google Calendar", "action": "Connect your Google Calendar account"},
                    {"title": "Schedule a meeting", "action": "Schedule a team meeting for tomorrow at 2 PM"},
                    {"title": "Check today's events", "action": "What's on my calendar today?"}
                ],
                "actions": []
            }
    
    async def _handle_email_intent(
        self,
        message: str,
        intent: Dict[str, Any],
        user_id: int,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Handle email-related requests."""
        
        return {
            "content": "I can help you manage your emails. You can ask me to summarize recent emails, suggest replies, or help compose new messages. To get started, you'll need to connect your Gmail account.",
            "suggestions": [
                {"title": "Connect Gmail", "action": "Connect your Gmail account"},
                {"title": "Summarize emails", "action": "Summarize my last 5 emails"},
                {"title": "Draft a reply", "action": "Help me reply to my latest email"}
            ],
            "actions": []
        }
    
    async def _handle_search_intent(
        self,
        message: str,
        intent: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle search and information requests."""
        
        try:
            # Use web search for current information
            search_results = await self.search_service.search_web(message)
            
            # Summarize search results with AI
            system_prompt = """
            You are a research assistant. Based on the search results provided, 
            give a comprehensive and accurate answer to the user's question.
            Cite sources when possible and provide additional context.
            """
            
            search_context = "\n".join([
                f"Source: {result['title']}\nURL: {result['url']}\nContent: {result['snippet']}\n"
                for result in search_results[:5]
            ])
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Question: {message}\n\nSearch Results:\n{search_context}"}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            return {
                "content": response.choices[0].message.content,
                "suggestions": [
                    {"title": "Search more", "action": f"Tell me more about {message}"},
                    {"title": "Related topics", "action": "What are some related topics?"}
                ],
                "actions": []
            }
            
        except Exception as e:
            return {
                "content": "I can help you search for information on any topic. What would you like to know more about?",
                "suggestions": [
                    {"title": "Ask a question", "action": "What are the latest trends in AI?"},
                    {"title": "Look up facts", "action": "Tell me about renewable energy"},
                    {"title": "Get definitions", "action": "What is machine learning?"}
                ],
                "actions": []
            }
    
    async def _handle_general_conversation(
        self,
        message: str,
        context: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Handle general conversation and questions."""
        
        context_str = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in context[-5:]  # Last 5 messages for context
        ])
        
        system_prompt = f"""
        You are a helpful AI productivity assistant. You help users manage their tasks, 
        calendar, emails, and answer questions. Be friendly, concise, and helpful.
        
        Recent conversation:
        {context_str}
        
        Provide a natural response and suggest relevant actions the user might want to take.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            return {
                "content": response.choices[0].message.content,
                "suggestions": [
                    {"title": "Create a task", "action": "Create a new task for me"},
                    {"title": "Check calendar", "action": "What's on my calendar today?"},
                    {"title": "Email summary", "action": "Summarize my recent emails"}
                ],
                "actions": []
            }
            
        except Exception as e:
            return {
                "content": "Hello! I'm your AI productivity assistant. I can help you manage tasks, schedule events, handle emails, and answer questions. How can I assist you today?",
                "suggestions": [
                    {"title": "Create a task", "action": "Create a high-priority task to review quarterly reports"},
                    {"title": "Schedule meeting", "action": "Schedule a team meeting for tomorrow at 2 PM"},
                    {"title": "Ask a question", "action": "What are the latest trends in AI productivity tools?"}
                ],
                "actions": []
            }
    
    async def _get_conversation_context(
        self,
        user_id: int,
        session_id: str,
        db: AsyncSession
    ) -> List[Dict[str, str]]:
        """Get recent conversation context for better responses."""
        
        try:
            query = select(Message).where(
                Message.user_id == user_id,
                Message.session_id == session_id
            ).order_by(Message.created_at.desc()).limit(10)
            
            result = await db.execute(query)
            messages = result.scalars().all()
            
            return [
                {
                    "role": "user" if msg.type == MessageType.USER else "assistant",
                    "content": msg.content
                }
                for msg in reversed(messages)
            ]
            
        except Exception as e:
            return []