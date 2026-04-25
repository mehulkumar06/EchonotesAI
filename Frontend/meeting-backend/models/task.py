from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func

from database import Base


class Task(Base):
    """
    Task model — meeting action items and manually planned tasks.
    board_column drives Kanban; status mirrors legacy pending/completed for API consumers.
    """

    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    note_id = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    task = Column(Text, nullable=False)
    deadline = Column(String(10), nullable=True)
    status = Column(String(20), default="pending")
    priority = Column(String(20), default="medium")
    assignee = Column(String(120), nullable=True)
    board_column = Column(String(32), default="todo")
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Task(id={self.id}, task='{self.task[:30]}...', board_column={self.board_column})>"
