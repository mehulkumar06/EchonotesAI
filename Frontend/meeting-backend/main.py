# main.py - FastAPI Application Entry Point
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db
from routes import transcribe_router, notes_router, tasks_router, commands_router, whiteboard_router

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="EchoNotes AI Backend",
    description="Local-first AI meeting assistant with Whisper transcription and GPT analysis",
    version="1.0.0"
)

# Configure CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    init_db()
    print("🚀 EchoNotes AI Backend started successfully")

# Register routes
app.include_router(transcribe_router, tags=["Transcription"])
app.include_router(notes_router, tags=["Notes"])
app.include_router(tasks_router, tags=["Tasks"])
app.include_router(commands_router, tags=["Voice Commands"])
app.include_router(whiteboard_router, tags=["Whiteboard"])

# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "EchoNotes AI Backend",
        "version": "1.0.0",
        "message": "Local-first AI meeting assistant is running"
    }

# Run with: uvicorn main:app --reload --port 5167

