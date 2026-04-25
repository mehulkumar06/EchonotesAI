# schemas/__init__.py
from .note import NoteCreate, NoteResponse, NoteListResponse
from .task import TaskCreate, TaskResponse, TaskUpdate, TaskAnalyticsSummary
from .whiteboard import WhiteboardResponse, WhiteboardSave

__all__ = [
    "NoteCreate",
    "NoteResponse",
    "NoteListResponse",
    "TaskCreate",
    "TaskResponse",
    "TaskUpdate",
    "TaskAnalyticsSummary",
    "WhiteboardResponse",
    "WhiteboardSave",
]
