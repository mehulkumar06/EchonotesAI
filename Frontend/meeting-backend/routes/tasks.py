from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db, ensure_manual_tasks_note, MANUAL_NOTE_FILENAME
from models import Task, Note
from schemas import TaskResponse, TaskUpdate, TaskCreate, TaskAnalyticsSummary

router = APIRouter()


def _derive_status(board_column: str) -> str:
    return "completed" if board_column == "done" else "pending"


def _sync_completion_fields(task: Task) -> None:
    if task.board_column == "done":
        task.status = "completed"
        if task.completed_at is None:
            task.completed_at = datetime.now(timezone.utc)
    else:
        task.status = "pending"
        task.completed_at = None


def _task_to_response(task: Task, note_filename: Optional[str] = None) -> TaskResponse:
    fn = note_filename
    if fn == MANUAL_NOTE_FILENAME:
        fn = None
    return TaskResponse(
        id=task.id,
        note_id=task.note_id,
        note_filename=fn,
        task=task.task,
        deadline=task.deadline,
        status=_derive_status(task.board_column or "todo"),
        priority=task.priority or "medium",
        assignee=task.assignee,
        board_column=task.board_column or "todo",
        position_x=task.position_x,
        position_y=task.position_y,
        completed_at=task.completed_at,
        created_at=task.created_at,
    )


@router.get("/tasks", response_model=List[TaskResponse])
async def get_all_tasks(db: Session = Depends(get_db)):
    results = (
        db.query(Task, Note.filename)
        .join(Note, Task.note_id == Note.id)
        .order_by(Task.created_at.desc())
        .all()
    )
    return [_task_to_response(t, fn) for t, fn in results]


@router.get("/tasks/note/{note_id}", response_model=List[TaskResponse])
async def get_tasks_by_note(note_id: int, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.note_id == note_id).all()
    note = db.query(Note).filter(Note.id == note_id).first()
    fn = note.filename if note else None
    return [_task_to_response(t, fn) for t in tasks]


@router.post("/tasks", response_model=TaskResponse)
async def create_task(body: TaskCreate, db: Session = Depends(get_db)):
    note_id = body.note_id
    if note_id is not None:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
    else:
        note_id = ensure_manual_tasks_note()

    task = Task(
        note_id=note_id,
        task=body.task.strip(),
        deadline=body.deadline,
        priority=body.priority,
        assignee=body.assignee.strip() if body.assignee else None,
        board_column=body.board_column,
        status="pending",
    )
    _sync_completion_fields(task)
    db.add(task)
    db.commit()
    db.refresh(task)
    note = db.query(Note).filter(Note.id == task.note_id).first()
    return _task_to_response(task, note.filename if note else None)


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if body.task is not None:
        task.task = body.task.strip()
    if body.deadline is not None:
        task.deadline = body.deadline or None
    if body.priority is not None:
        task.priority = body.priority
    if body.assignee is not None:
        task.assignee = body.assignee.strip() if body.assignee else None
    if body.position_x is not None:
        task.position_x = body.position_x
    if body.position_y is not None:
        task.position_y = body.position_y

    if body.board_column is not None:
        task.board_column = body.board_column
    if body.status is not None:
        if body.status == "completed":
            task.board_column = "done"
        elif body.status == "pending":
            task.board_column = "todo"

    if body.board_column is not None or body.status is not None:
        _sync_completion_fields(task)

    db.commit()
    db.refresh(task)
    note = db.query(Note).filter(Note.id == task.note_id).first()
    return _task_to_response(task, note.filename if note else None)


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"success": True, "task_id": task_id}


@router.get("/tasks/analytics/summary", response_model=TaskAnalyticsSummary)
async def task_analytics_summary(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    seven_ago = day_start - timedelta(days=7)

    tasks = db.query(Task).all()
    total = len(tasks)
    done = [t for t in tasks if (t.board_column or "todo") == "done"]
    completed_count = len(done)
    active = total - completed_count
    completion_rate = (completed_count / total * 100.0) if total else 0.0

    def is_overdue(t: Task) -> bool:
        if (t.board_column or "") == "done" or not t.deadline:
            return False
        try:
            d = datetime.strptime(t.deadline, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            return d < day_start
        except ValueError:
            return False

    overdue_count = sum(1 for t in tasks if is_overdue(t))

    by_assignee: dict[str, dict[str, int]] = {}
    for t in tasks:
        key = (t.assignee or "").strip() or "Unassigned"
        if key not in by_assignee:
            by_assignee[key] = {"total": 0, "completed": 0}
        by_assignee[key]["total"] += 1
        if (t.board_column or "todo") == "done":
            by_assignee[key]["completed"] += 1

    by_priority: dict[str, int] = {}
    for t in tasks:
        p = t.priority or "medium"
        by_priority[p] = by_priority.get(p, 0) + 1

    by_column: dict[str, int] = {}
    for t in tasks:
        c = t.board_column or "todo"
        by_column[c] = by_column.get(c, 0) + 1

    completed_last_7 = 0
    created_last_7 = 0
    def aware(dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    for t in tasks:
        if t.created_at and aware(t.created_at) >= seven_ago:
            created_last_7 += 1
        if (
            (t.board_column or "") == "done"
            and t.completed_at
            and aware(t.completed_at) >= seven_ago
        ):
            completed_last_7 += 1

    durations: list[float] = []
    for t in done:
        if t.completed_at and t.created_at:
            ca = aware(t.completed_at)
            cr = aware(t.created_at)
            delta = (ca - cr).total_seconds() / 86400.0
            if delta >= 0:
                durations.append(delta)

    avg_days = sum(durations) / len(durations) if durations else None

    return TaskAnalyticsSummary(
        total_tasks=total,
        completed_tasks=completed_count,
        completion_rate=round(completion_rate, 1),
        active_tasks=active,
        overdue_count=overdue_count,
        by_assignee=by_assignee,
        by_priority=by_priority,
        by_column=by_column,
        completed_last_7_days=completed_last_7,
        created_last_7_days=created_last_7,
        avg_days_to_complete=round(avg_days, 2) if avg_days is not None else None,
    )
