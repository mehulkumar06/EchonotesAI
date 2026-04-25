from typing import Optional

from pydantic import BaseModel
from datetime import datetime


class WhiteboardResponse(BaseModel):
    diagram_xml: str
    updated_at: Optional[datetime] = None


class WhiteboardSave(BaseModel):
    diagram_xml: str
