from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func

from database import Base


class WhiteboardState(Base):
    """Singleton-style storage for diagrams.net (draw.io) diagram XML."""

    __tablename__ = "whiteboard_state"

    id = Column(Integer, primary_key=True, autoincrement=True)
    diagram_xml = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
