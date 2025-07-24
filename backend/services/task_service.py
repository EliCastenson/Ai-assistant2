from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json

from models.task import Task, TaskPriority, TaskStatus

class TaskService:
    def __init__(self):
        pass
    
    async def create_task_from_ai(
        self,
        task_data: Dict[str, Any],
        user_id: int,
        db: AsyncSession
    ) -> Task:
        """Create a task from AI-extracted data."""
        try:
            # Parse due date if provided as string
            due_date = None
            if task_data.get("due_date"):
                if isinstance(task_data["due_date"], str):
                    due_date = datetime.fromisoformat(task_data["due_date"].replace("Z", "+00:00"))
                else:
                    due_date = task_data["due_date"]
            
            # Map priority string to enum
            priority_map = {
                "low": TaskPriority.LOW,
                "medium": TaskPriority.MEDIUM,
                "high": TaskPriority.HIGH,
                "urgent": TaskPriority.URGENT
            }
            priority = priority_map.get(task_data.get("priority", "medium"), TaskPriority.MEDIUM)
            
            # Create task
            task = Task(
                user_id=user_id,
                title=task_data["title"],
                description=task_data.get("description"),
                priority=priority,
                due_date=due_date,
                ai_suggested=True,
                estimated_duration=task_data.get("estimated_duration")
            )
            
            db.add(task)
            await db.commit()
            await db.refresh(task)
            
            return task
            
        except Exception as e:
            await db.rollback()
            raise Exception(f"Failed to create task from AI: {str(e)}")
    
    async def get_task_insights(self, user_id: int, db: AsyncSession) -> Dict[str, Any]:
        """Get AI insights about user's tasks."""
        try:
            # Get all tasks for analysis
            query = select(Task).where(Task.user_id == user_id)
            result = await db.execute(query)
            tasks = result.scalars().all()
            
            if not tasks:
                return {
                    "total_tasks": 0,
                    "completed_tasks": 0,
                    "pending_tasks": 0,
                    "overdue_tasks": 0,
                    "completion_rate": 0,
                    "insights": ["Create your first task to get started!"],
                    "suggestions": []
                }
            
            # Calculate metrics
            total_tasks = len(tasks)
            completed_tasks = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
            pending_tasks = len([t for t in tasks if t.status in [TaskStatus.TODO, TaskStatus.IN_PROGRESS]])
            overdue_tasks = len([
                t for t in tasks 
                if t.due_date and t.due_date < datetime.utcnow() and t.status != TaskStatus.COMPLETED
            ])
            
            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            # Generate insights
            insights = []
            suggestions = []
            
            if completion_rate > 80:
                insights.append("Great job! You have a high task completion rate.")
            elif completion_rate < 50:
                insights.append("Consider breaking down large tasks into smaller, manageable ones.")
                suggestions.append("Break down complex tasks into subtasks")
            
            if overdue_tasks > 0:
                insights.append(f"You have {overdue_tasks} overdue tasks. Consider prioritizing them.")
                suggestions.append("Review and reschedule overdue tasks")
            
            if pending_tasks > 10:
                insights.append("You have many pending tasks. Consider using priority levels to focus.")
                suggestions.append("Set priorities for your pending tasks")
            
            return {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "pending_tasks": pending_tasks,
                "overdue_tasks": overdue_tasks,
                "completion_rate": round(completion_rate, 1),
                "insights": insights,
                "suggestions": suggestions
            }
            
        except Exception as e:
            return {
                "error": f"Failed to generate task insights: {str(e)}",
                "total_tasks": 0,
                "completed_tasks": 0,
                "pending_tasks": 0,
                "overdue_tasks": 0,
                "completion_rate": 0,
                "insights": [],
                "suggestions": []
            }
    
    async def suggest_task_improvements(self, task_id: int, user_id: int, db: AsyncSession) -> List[str]:
        """Suggest improvements for a specific task."""
        try:
            query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            result = await db.execute(query)
            task = result.scalar_one_or_none()
            
            if not task:
                return ["Task not found"]
            
            suggestions = []
            
            # Check if task has description
            if not task.description or len(task.description.strip()) < 10:
                suggestions.append("Add a detailed description to clarify the task requirements")
            
            # Check if task has due date
            if not task.due_date:
                suggestions.append("Set a due date to help with time management")
            elif task.due_date < datetime.utcnow() and task.status != TaskStatus.COMPLETED:
                suggestions.append("This task is overdue - consider rescheduling or prioritizing")
            
            # Check priority vs due date
            if task.due_date and task.due_date < datetime.utcnow() + timedelta(days=1):
                if task.priority in [TaskPriority.LOW, TaskPriority.MEDIUM]:
                    suggestions.append("Consider increasing priority for this urgent task")
            
            # Check for long-running tasks
            if task.created_at < datetime.utcnow() - timedelta(days=7) and task.status == TaskStatus.IN_PROGRESS:
                suggestions.append("This task has been in progress for a while - consider breaking it down")
            
            return suggestions if suggestions else ["This task looks well-organized!"]
            
        except Exception as e:
            return [f"Error analyzing task: {str(e)}"]