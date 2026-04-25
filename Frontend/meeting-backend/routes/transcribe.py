import os
import json
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil

from database import get_db
from models import Note, Task
from services import transcribe_audio, generate_summary, extract_tasks, detect_sentiment, detect_language

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/transcribe")
async def transcribe_meeting(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Main endpoint: Upload audio → Whisper transcribe → GPT summarize → Extract tasks → Detect Sentiment + Language → Store in DB
    
    This is the core pipeline that processes meeting recordings.
    """
    file_path = None
    try:
        # 1. Save uploaded audio file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Transcribe audio using Whisper API
        raw_transcript = await transcribe_audio(str(file_path))
        
        # 3. Clean transcript (for now, just use raw - can add cleaning later)
        transcript = raw_transcript.strip()
        
        # 4. Generate summary and key points using GPT
        summary_data = await generate_summary(transcript)
        summary = summary_data.get("summary", "")
        key_points = json.dumps(summary_data.get("key_points", []))
        
        # 5. Extract tasks using GPT
        tasks_data = await extract_tasks(transcript)
        
        # 6. Detect Sentiment
        sentiment = await detect_sentiment(transcript)

        # 7. Detect Language
        language = await detect_language(transcript)
        
        # 8. Store note in database
        note = Note(
            filename=file.filename,
            raw_transcript=raw_transcript,
            transcript=transcript,
            summary=summary,
            key_points=key_points,
            sentiment=sentiment,
            language=language
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        
        # 7. Store tasks in database
        created_tasks = []
        for task_data in tasks_data:
            task = Task(
                note_id=note.id,
                task=task_data.get("task", ""),
                deadline=task_data.get("deadline"),
                status="pending",
                priority="medium",
                board_column="todo",
            )
            db.add(task)
            created_tasks.append({
                "task": task.task,
                "deadline": task.deadline
            })
        
        db.commit()
        
        # 8. Optional: Delete audio file after processing (uncomment if needed)
        # file_path.unlink()
        
        # 9. Return complete results
        return {
            "success": True,
            "note_id": note.id,
            "filename": note.filename,
            "transcript": note.transcript,
            "summary": note.summary,
            "key_points": json.loads(note.key_points),
            "tasks": created_tasks,
            "sentiment": note.sentiment,
            "language": note.language,
            "created_at": note.created_at.isoformat()
        }
    
    except Exception as e:
        # Cleanup file on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
