from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal

BoardColumn = Literal["backlog", "todo", "in_progress", "done"]
Priority = Literal["low", "medium", "high", "urgent"]


class TaskCreate(BaseModel):
    task: str = Field(..., min_length=1)
    note_id: Optional[int] = None
    deadline: Optional[str] = None
    priority: Priority = "medium"
    assignee: Optional[str] = None
    board_column: BoardColumn = "todo"


class TaskResponse(BaseModel):
    id: int
    note_id: int
    note_filename: Optional[str] = None
    task: str
    deadline: Optional[str]
    status: str
    priority: str = "medium"
    assignee: Optional[str] = None
    board_column: str = "todo"
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    """Partial update: Kanban moves, completion, planner fields, canvas position."""

    status: Optional[str] = None
    board_column: Optional[BoardColumn] = None
    priority: Optional[Priority] = None
    assignee: Optional[str] = None
    deadline: Optional[str] = None
    task: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None


class TaskAnalyticsSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    active_tasks: int
    overdue_count: int
    by_assignee: dict[str, dict[str, int]]
    by_priority: dict[str, int]
    by_column: dict[str, int]
    completed_last_7_days: int
    created_last_7_days: int
    avg_days_to_complete: Optional[float]
