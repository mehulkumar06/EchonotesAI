# EchoNotes AI - Backend

Local-first AI meeting assistant with Whisper transcription and GPT analysis.

## Features

- 🎤 Audio transcription using OpenAI Whisper API
- 🤖 AI summarization and key points extraction using GPT
- ✅ Automatic task extraction with deadline parsing
- 🗣️ Voice command processing
- 💾 Local SQLite database storage
- 🔍 Simple search functionality

## Setup

### 1. Install Dependencies

```bash
cd Frontend/meeting-backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_URL=sqlite:///./database.db
CORS_ORIGINS=http://localhost:3000
UPLOAD_DIR=uploads
```

### 3. Run the Server

```bash
uvicorn main:app --reload --port 5167
```

The server will start at `http://localhost:5167`

## API Endpoints

### Transcription
- `POST /transcribe` - Upload audio → transcribe → summarize → extract tasks

### Notes
- `GET /notes` - List all notes
- `GET /notes/{id}` - Get single note with full details
- `DELETE /notes/{id}` - Delete note
- `GET /search?q=query` - Search notes

### Tasks
- `GET /tasks` - List all tasks
- `GET /tasks/note/{note_id}` - Get tasks for specific note
- `PATCH /tasks/{id}` - Update task status

### Voice Commands
- `POST /voice-command` - Process voice command using stored transcript

## Project Structure

```
meeting-backend/
├── main.py              # FastAPI application entry
├── database.py          # SQLAlchemy configuration
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create from .env.example)
├── models/              # Database models
│   ├── note.py
│   └── task.py
├── schemas/             # Pydantic schemas
│   ├── note.py
│   └── task.py
├── services/            # Business logic
│   ├── whisper_service.py
│   └── gpt_service.py
└── routes/              # API endpoints
    ├── transcribe.py
    ├── notes.py
    ├── tasks.py
    └── commands.py
```

## Database Schema

### Notes Table
- `id` - Primary key
- `filename` - Original audio filename
- `raw_transcript` - Original Whisper output
- `transcript` - Cleaned transcript
- `summary` - AI-generated summary
- `key_points` - JSON array of key points
- `created_at` - Timestamp

### Tasks Table
- `id` - Primary key
- `note_id` - Foreign key to notes
- `task` - Task description
- `deadline` - ISO date (YYYY-MM-DD)
- `status` - pending/completed
- `created_at` - Timestamp

## Development

### API Documentation

Visit `http://localhost:5167/docs` for interactive API documentation (Swagger UI).

### Database

SQLite database is created automatically on first run at `database.db`.

## Notes

- All data is stored locally (SQLite database)
- Audio files are saved in `uploads/` directory
- OpenAI API is used only for processing (Whisper + GPT)
- No cloud storage or external databases
