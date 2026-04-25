from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import WhiteboardState
from schemas import WhiteboardResponse, WhiteboardSave

router = APIRouter()

WHITEBOARD_ROW_ID = 1


@router.get("/whiteboard", response_model=WhiteboardResponse)
async def get_whiteboard(db: Session = Depends(get_db)):
    row = db.query(WhiteboardState).filter(WhiteboardState.id == WHITEBOARD_ROW_ID).first()
    if not row:
        return WhiteboardResponse(diagram_xml="", updated_at=None)
    return WhiteboardResponse(diagram_xml=row.diagram_xml or "", updated_at=row.updated_at)


@router.put("/whiteboard", response_model=WhiteboardResponse)
async def save_whiteboard(body: WhiteboardSave, db: Session = Depends(get_db)):
    row = db.query(WhiteboardState).filter(WhiteboardState.id == WHITEBOARD_ROW_ID).first()
    if not row:
        row = WhiteboardState(id=WHITEBOARD_ROW_ID, diagram_xml=body.diagram_xml)
        db.add(row)
    else:
        row.diagram_xml = body.diagram_xml
    db.commit()
    db.refresh(row)
    return WhiteboardResponse(diagram_xml=row.diagram_xml, updated_at=row.updated_at)
