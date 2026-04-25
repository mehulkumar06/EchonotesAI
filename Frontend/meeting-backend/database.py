from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _sqlite_column_names(conn, table: str) -> set[str]:
    r = conn.execute(text(f'PRAGMA table_info("{table}")'))
    return {row[1] for row in r}


def migrate_sqlite_schema():
    """Add columns to existing SQLite DBs (create_all does not alter tables)."""
    if not DATABASE_URL.startswith("sqlite"):
        return
    with engine.begin() as conn:
        cols = _sqlite_column_names(conn, "tasks")
        alters = []
        if "priority" not in cols:
            alters.append('ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT "medium"')
        if "assignee" not in cols:
            alters.append("ALTER TABLE tasks ADD COLUMN assignee VARCHAR(120)")
        if "board_column" not in cols:
            alters.append('ALTER TABLE tasks ADD COLUMN board_column VARCHAR(32) DEFAULT "todo"')
        if "position_x" not in cols:
            alters.append("ALTER TABLE tasks ADD COLUMN position_x FLOAT")
        if "position_y" not in cols:
            alters.append("ALTER TABLE tasks ADD COLUMN position_y FLOAT")
        if "completed_at" not in cols:
            alters.append("ALTER TABLE tasks ADD COLUMN completed_at DATETIME")
        for stmt in alters:
            conn.execute(text(stmt))
        if "board_column" not in cols:
            conn.execute(text("UPDATE tasks SET board_column = 'done' WHERE status = 'completed'"))


def init_db():
    from models import Note, Task, WhiteboardState

    Base.metadata.create_all(bind=engine)
    migrate_sqlite_schema()
    print("✅ Database initialized successfully")


MANUAL_NOTE_FILENAME = "__manual_tasks__"


def ensure_manual_tasks_note() -> int:
    """Return note id used for tasks not tied to a specific meeting."""
    from models import Note

    db = SessionLocal()
    try:
        existing = db.query(Note).filter(Note.filename == MANUAL_NOTE_FILENAME).first()
        if existing:
            return existing.id
        note = Note(
            filename=MANUAL_NOTE_FILENAME,
            raw_transcript="",
            transcript="",
            summary="Placeholder for manually created tasks (EchoNotes task planner).",
            key_points="[]",
            sentiment="Neutral",
            language="en",
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return note.id
    finally:
        db.close()
