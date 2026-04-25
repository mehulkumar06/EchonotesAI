# EchoNotes Backend - Quick Start Guide

## Prerequisites

You need Python 3.8+ installed. Check if you have Python:

```bash
python --version
# or
python3 --version
```

If Python is not installed, download it from: https://www.python.org/downloads/

## Setup Steps

### 1. Navigate to Backend Directory

```bash
cd d:\Capstone\EchonotesAI\Frontend\meeting-backend
```

### 2. Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
```

### 5. Run the Server

```bash
uvicorn main:app --reload --port 5167
```

The backend will be available at: `http://localhost:5167`

## Verify Installation

1. Visit `http://localhost:5167` - you should see a JSON response
2. Visit `http://localhost:5167/docs` - interactive API documentation

## Test the API

### Upload and Process Audio

```bash
curl -X POST "http://localhost:5167/transcribe" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your-audio-file.webm"
```

### Get All Notes

```bash
curl http://localhost:5167/notes
```

## Troubleshooting

### Python Not Found
- Install Python from python.org
- Make sure Python is added to PATH during installation

### Module Not Found
- Make sure you activated the virtual environment
- Run `pip install -r requirements.txt` again

### OpenAI API Errors
- Check that your API key is correct in `.env`
- Ensure you have credits in your OpenAI account

## Next Steps

Once the backend is running:
1. Test the `/transcribe` endpoint with a sample audio file
2. Verify the database is created (`database.db`)
3. Check that notes and tasks are stored correctly
4. Move to Phase 2: Frontend integration
