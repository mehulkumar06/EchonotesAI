# EchoNotes AI - Intelligent Meeting Assistant

**EchoNotes AI** is a privacy-first, local meeting assistant designed to transform how you capture, process, and interact with your meeting content. It leverages advanced AI (OpenAI GPT-4o & Whisper) to provide accurate transcriptions, intelligent summaries, deep sentiment analysis, real-time language translation, and actionable task management.

---

### 🎓 Capstone Project Details
This project is the Capstone Project for **VIT Bhopal University**, developed by **Group Number 41** under the supervision of **Dr. Virendra Singh Khushwah**.

**Team Members:**

- **Vedika Vivek Gangil** (22BSA10001)
- **Nihalika Kumari** (22BSA10033)
- **Mehul Kumar** (22BSA10317)
- **Sumit Kumar** (22BSA10024)

---

## 🚀 Project Features by Phase

# **Phase 1: Core EchoNotes AI (Existing Work)**

### 🎙️ Smart Recording & Transcription
- **Dual Source Recording**: Capture high-fidelity audio from your **Microphone** (in-person) or **System Audio** (virtual meetings).
- **Whisper Integration**: Uses OpenAI's Whisper model for state-of-the-art speech-to-text accuracy.
- **Real-Time Visuals**: Live audio visualization and recording status indicators.

### 🧠 AI-Powered Analysis
- **Intelligent Summarization**: Automatically generates concise summaries capturing the essence of discussions.
- **Key Points Extraction**: Identifies critical bullet points and key takeaways.
- **Sentiment Analysis**: Detects the emotional tone of meetings (Positive, Neutral, Tense, Urgent).

### 🌍 Language & Translation
- **Auto-Language Detection**: Automatically identifies the primary language spoken.
- **Instant Translation**: Translate summaries into multiple languages (English, Hindi, Marathi, French, Spanish) on demand.

### ✅ Smart Task Management (Baseline)
- **Automated Extraction**: Detects promises and deadlines mentioned in conversation.
- **Unified Dashboard**: Manage tasks across all meetings with deadline tracking (Due Soon, Overdue).
- **Interactive Management**: Mark tasks as completed directly from the dashboard.

### 🗣️ Voice Command System
- **Interactive Q&A**: Ask questions about your notes using your voice (e.g., *"What were the action items?"*).
- **Audio Responses**: The AI analyzes the transcript and answers you verbally.

### 📤 Export & Organization
- **Note Library**: Searchable grid view of all past meetings.
- **One-Click Export**: Download comprehensive text files including metadata, summaries, and transcripts.

# **Phase 2: Advanced Planning, Collaboration, and Companion Tools (New Work)**

### 🧩 Advanced Task Workspace
- **Dedicated Task Hub Page**: Added a full `/tasks` experience with section-based navigation (Overview, Planner, Kanban, Whiteboard, Task Map, Analytics).
- **Task Planner**: Create tasks manually with priority, assignee, deadline, optional meeting linking, and initial Kanban column assignment.
- **Stronger Task Data Model**: Extended tasks with `priority`, `assignee`, `board_column`, `position_x`, `position_y`, and `completed_at` for richer workflow tracking.

### 🗂️ Kanban Workflow
- **Drag-and-Drop Board**: Added interactive Kanban support with Backlog, To Do, In Progress, and Done lanes.
- **Status Synchronization**: Moving cards across lanes syncs directly to backend task status and completion fields.
- **Inline Board Management**: Supports direct task deletion and metadata display (priority, assignee, deadline) from board cards.

### 📊 Task Intelligence and Analytics
- **Analytics API + UI Panel**: Introduced task analytics summary metrics (completion rate, active tasks, overdue count, 7-day trend, and average completion time).
- **Distribution Insights**: Added breakdowns by assignee, priority, and Kanban column to support workload visibility.

### 🧠 Visual Planning Additions
- **Persistent Whiteboard Backend**: Added `/whiteboard` read/write endpoints and schema/model support for storing diagrams.net (draw.io) XML state.
- **Task Mapping Support**: Included mind-map style planning components and graph tooling for visual task exploration.

### 🛠️ Backend and Data Improvements
- **SQLite Schema Migration Helpers**: Added startup-safe schema evolution for existing local databases.
- **Manual Task Anchor Note**: Introduced internal note handling for tasks created outside a meeting transcript context.
- **Expanded API Layer**: Added frontend API methods for task CRUD, task analytics, and whiteboard persistence endpoints.

### 🧩 Browser Companion (Extension)
- **Chrome Extension Companion**: Added a standalone extension for quick note capture, selection capture, local persistence, and optional backend sync.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Shadcn UI.
- **Backend**: Python 3.10+, FastAPI, SQLite, Pydantic.
- **AI Services**: OpenAI API (GPT-4o, Whisper-1).
- **Database**: SQLite (Local storage for privacy).

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher
- **Python**: v3.10 or higher
- **OpenAI API Key**: Required for transcription and analysis features.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/echonotes-ai.git
cd echonotes-ai/Frontend
```
*(Note: If you downloaded the project directly, navigate to the `Frontend` folder where `package.json` resides.)*

### 2. Backend Setup
The backend handles audio processing, database management, and AI interactions.

```bash
# Navigate to backend directory
cd meeting-backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in the `meeting-backend` directory with your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

start the backend server: (It runs on http://localhost:8000)
```bash
python main.py
```

### 3. Frontend Setup
The frontend provides the user interface and interacts with the backend.

```bash
# Open a new terminal and navigate to the Frontend root
cd .. 

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit **http://localhost:3000** in your browser to start using EchoNotes AI.

---

## 📖 Usage Guide
1.  **Record a Meeting**:
    *   Click the **Microphone** card to start recording.
    *   Select your source (Mic or System Audio).
    *   Click the big red button to begin.
    *   Click Stop when finished.
2.  **Process Audio**:
    *   Click "Process Recording" to transcribe and analyze.
    *   Wait for the AI to generate the summary, tasks, and sentiment.
3.  ** Interact with Results**:
    *   **Translation**: Select a language from the dropdown in the summary card and 
    click the translate icon.
    *   **Voice Q&A**: Click "Ask a Question" in the Voice Command panel to query your 
    notes.
    *   **Tasks**: View extracted action items in the Task List.
4.  **Manage History**:
    *   Go to "View Notes" to see past meetings.
    *   Go to "Tasks Dashboard" for a unified view of all pending tasks.


### Core App Flow

1. **Record a meeting**
   - Click the **Microphone** card.
   - Select source (**Mic** or **System Audio**).
   - Start recording and stop when done.

2. **Process and analyze**
   - Click **Process Recording**.
   - Wait for transcript, summary, key points, sentiment, and extracted tasks.

3. **Use AI outputs**
   - **Translation**: choose a language and translate summary.
   - **Voice Q&A**: ask transcript-based questions.
   - **Notes**: open and review past note entries from the notes library.

### Phase 2 Task Workspace Flow

1. Open **Tasks** page from the app navigation.
2. Use **Planner** to create new tasks with priority, assignee, deadline, and optional note linking.
3. Use **Kanban** to drag tasks between Backlog, To Do, In Progress, and Done.
4. Use **Whiteboard** to draft diagrams (draw.io compatible, persisted in backend).
5. Use **Analytics** to track completion rate, overdue tasks, and assignee distribution.

---

## 🧩 Chrome Extension Setup & Usage

The Chrome extension lives in `chrome-extension` and works as a companion to the web app.

### Setup

1. Start backend and frontend:
   - Backend: run FastAPI server (default `http://localhost:5167` in frontend API config).
   - Frontend: `npm run dev` (default `http://localhost:3000`).
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select `E:/Capstone/EchonotesAI/chrome-extension`.
5. Pin the extension from the toolbar.

### How to use extension

1. Open any webpage.
2. (Optional) Highlight text on the page.
3. Open **EchoNotes AI Companion** extension popup.
4. Click **Capture selection** to import highlighted text.
5. Add title/content and click **Save note**.
6. Optional: enable API sync in popup settings for backend sync; otherwise notes remain in local Chrome storage.

For extension implementation details, see `chrome-extension/README.md`.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

