from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Note(Base):
    """
    Note model - stores meeting recordings with transcripts and AI analysis
    """
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    raw_transcript = Column(Text, nullable=False)  # Original Whisper output
    transcript = Column(Text, nullable=False)  # Cleaned/formatted version
    summary = Column(Text, nullable=True)  # AI-generated summary
    key_points = Column(Text, nullable=True)  # JSON array of key points
    sentiment = Column(String(20), nullable=True, default="Neutral")  # Positive, Neutral, Tense, Urgent
    language = Column(String(50), nullable=True)  # Detected language
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Note(id={self.id}, filename='{self.filename}', created_at={self.created_at})>"
