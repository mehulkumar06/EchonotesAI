# EchoNotes AI - Testing Guide

## Prerequisites

Both servers must be running:
- ✅ Backend: `http://localhost:5167`
- ✅ Frontend: `http://localhost:3000`

## Test Scenarios

### 1. Record and Process Audio

1. Open `http://localhost:3000`
2. Select audio source (Microphone or System/Tab audio)
3. Click "Start Recording"
4. Speak or play audio for 10-30 seconds
5. Click "Stop"
6. Click "Process with AI"
7. Wait for processing (Whisper → GPT)
8. **Verify:**
   - Summary appears
   - Key points listed
   - Tasks extracted with deadlines
   - Full transcript displayed

### 2. View Notes History

1. Click "Meeting Notes" in navigation
2. **Verify:**
   - All processed notes appear
   - Each shows filename, summary preview, timestamp
   - Click on a note to view details

### 3. Search Notes

1. On Notes page, type in search box
2. Try searching for keywords from your transcripts
3. **Verify:**
   - Results filter in real-time
   - Matches found in transcripts and summaries

### 4. Manage Tasks

1. On main page or note detail page, find the task list
2. Click checkbox to toggle task completion
3. **Verify:**
   - Task status updates immediately
   - Completed tasks show strikethrough
   - Overdue tasks highlighted in red

### 5. Voice Commands (Phase 3)

1. Go to a note detail page
2. In "Voice Commands" section, click "Ask a Question"
3. Speak a command like:
   - "What were the main action items?"
   - "Summarize the key decisions"
   - "What tasks were assigned?"
4. Click "Stop Recording"
5. **Verify:**
   - Your question appears as text
   - AI response displays
   - Response is spoken aloud (TTS)

### 6. Delete Note

1. On note detail page, click "Delete" button
2. Confirm deletion
3. **Verify:**
   - Note removed from database
   - Redirected to notes list
   - Note no longer appears

## API Testing (Optional)

Visit `http://localhost:5167/docs` for interactive API documentation (Swagger UI).

Test endpoints:
- `POST /transcribe` - Upload audio file
- `GET /notes` - List all notes
- `GET /notes/{id}` - Get note details
- `POST /voice-command` - Send voice command

## Common Issues

### Backend Issues

**"OpenAI API Error"**
- Check `.env` file has valid `OPENAI_API_KEY`
- Ensure you have credits in your OpenAI account

**"Database Error"**
- Delete `database.db` and restart backend
- Database will be recreated automatically

### Frontend Issues

**"Network Error"**
- Verify backend is running on port 5167
- Check CORS settings in backend `.env`

**"Recording Failed"**
- Grant microphone permissions in browser
- Try different audio source (mic vs system)

**"Voice Command Not Working"**
- Ensure you're on a note detail page
- Check browser supports MediaRecorder API
- Verify microphone permissions

## Expected Behavior

### Processing Times
- Whisper transcription: 5-15 seconds (depends on audio length)
- GPT analysis: 3-10 seconds
- Total: ~10-25 seconds for full processing

### Data Storage
- All data stored locally in `database.db`
- Audio files saved in `uploads/` directory
- No cloud storage used

### Voice Commands
- Commands are transcribed (small audio file)
- Original meeting transcript is reused (efficient)
- No re-transcription of full meeting

## Success Criteria

✅ Can record and process audio  
✅ AI generates summary and key points  
✅ Tasks extracted with deadlines  
✅ Notes searchable  
✅ Tasks can be toggled  
✅ Voice commands work  
✅ TTS speaks responses  
✅ Notes can be deleted  

## Next Steps

If all tests pass:
- Phase 4: Smart Reminder System (optional)
- Phase 5: Polish & Export features
- Production deployment

If issues found:
- Check console logs (browser F12)
- Check backend terminal for errors
- Verify environment variables
- Test with sample audio files
