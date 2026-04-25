"use client";

import { useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import type { BoardColumn, EchoTask } from "@/types/task";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

const COLS: { id: BoardColumn; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "border-neutral-700" },
  { id: "todo", title: "To do", color: "border-sky-500/30" },
  { id: "in_progress", title: "In progress", color: "border-amber-500/30" },
  { id: "done", title: "Done", color: "border-emerald-500/30" },
];

function priorityClass(p?: string) {
  switch (p) {
    case "urgent":
      return "bg-rose-500/15 text-rose-300 border-rose-500/25";
    case "high":
      return "bg-orange-500/15 text-orange-300 border-orange-500/25";
    case "low":
      return "bg-slate-500/15 text-slate-400 border-slate-500/25";
    default:
      return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
  }
}

function KanbanCard({
  task,
  onDelete,
}: {
  task: EchoTask;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-white/10 bg-neutral-900/90 p-3 text-left shadow-sm group",
        isDragging && "ring-2 ring-indigo-500/40"
      )}
    >
      <div className="flex gap-2">
        <button
          type="button"
          className="mt-0.5 text-neutral-500 hover:text-neutral-300 cursor-grab active:cursor-grabbing touch-none"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm text-neutral-200 leading-snug">{task.task}</p>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span
              className={cn(
                "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border",
                priorityClass(task.priority)
              )}
            >
              {task.priority || "medium"}
            </span>
            {task.assignee && (
              <span className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                @{task.assignee}
              </span>
            )}
            {task.deadline && (
              <span className="text-[10px] text-neutral-500">{task.deadline}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="shrink-0 p-1 rounded text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Column({
  col,
  tasks,
  onDelete,
}: {
  col: (typeof COLS)[number];
  tasks: EchoTask[];
  onDelete: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border min-h-[320px] bg-neutral-950/40 p-2 transition-colors",
        col.color,
        isOver && "bg-indigo-500/5 ring-1 ring-indigo-500/30"
      )}
    >
      <div className="px-2 py-2 mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {col.title}
        </h3>
        <span className="text-[10px] text-neutral-600">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[560px] pr-0.5">
        {tasks.map((t) => (
          <KanbanCard key={t.id} task={t} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({
  tasks,
  onUpdate,
}: {
  tasks: EchoTask[];
  onUpdate: () => void;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const grouped = useMemo(() => {
    const g: Record<BoardColumn, EchoTask[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const t of tasks) {
      const c = (t.board_column || "todo") as BoardColumn;
      if (g[c]) g[c].push(t);
      else g.todo.push(t);
    }
    return g;
  }, [tasks]);

  const resolveColumn = (overId: string | number): BoardColumn | null => {
    const s = String(overId);
    if (["backlog", "todo", "in_progress", "done"].includes(s)) {
      return s as BoardColumn;
    }
    const tid = Number(s);
    if (!Number.isNaN(tid)) {
      const task = tasks.find((x) => x.id === tid);
      return (task?.board_column as BoardColumn) || "todo";
    }
    return null;
  };

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(Number(e.active.id));
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = Number(active.id);
    const target = resolveColumn(over.id);
    if (!target) return;
    const task = tasks.find((x) => x.id === taskId);
    if (!task || task.board_column === target) return;
    try {
      await apiClient.updateTask(taskId, { board_column: target });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await apiClient.deleteTask(id);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-neutral-100">
          Kanban board
        </CardTitle>
        <p className="text-sm text-neutral-500 font-normal">
          Drag cards between columns. Updates sync to the server.
        </p>
      </CardHeader>
      <CardContent>
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {COLS.map((col) => (
              <Column
                key={col.id}
                col={col}
                tasks={grouped[col.id]}
                onDelete={onDelete}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="rounded-lg border border-indigo-500/40 bg-neutral-900 p-3 shadow-xl w-[260px]">
                <p className="text-sm text-neutral-200">{activeTask.task}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}
