# routes/__init__.py
from .transcribe import router as transcribe_router
from .notes import router as notes_router
from .tasks import router as tasks_router
from .commands import router as commands_router
from .whiteboard import router as whiteboard_router

__all__ = [
    "transcribe_router",
    "notes_router",
    "tasks_router",
    "commands_router",
    "whiteboard_router",
]
