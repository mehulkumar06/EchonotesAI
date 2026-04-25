from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class NoteCreate(BaseModel):
    """Schema for creating a new note"""
    filename: str
    raw_transcript: str
    transcript: str
    summary: Optional[str] = None
    key_points: Optional[str] = None  # JSON string
    sentiment: Optional[str] = "Neutral"


class NoteResponse(BaseModel):
    """Schema for note response"""
    id: int
    filename: str
    raw_transcript: str
    transcript: str
    summary: Optional[str]
    key_points: Optional[str]
    sentiment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    """Schema for listing notes (without full transcript)"""
    id: int
    filename: str
    summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
