from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Note
from services import process_voice_command

router = APIRouter()


class VoiceCommandRequest(BaseModel):
    """Schema for voice command request"""
    command: str
    note_id: int


@router.post("/voice-command")
async def handle_voice_command(
    request: VoiceCommandRequest,
    db: Session = Depends(get_db)
):
    """
    Process voice command using stored transcript (no re-transcription)
    
    Optimization: Reuses stored transcript instead of re-transcribing audio
    """
    # Get the note with transcript
    note = db.query(Note).filter(Note.id == request.note_id).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Process command using GPT with stored transcript
    response = await process_voice_command(
        command=request.command,
        transcript=note.transcript
    )
    
    return {
        "success": True,
        "command": request.command,
        "response": response
    }
