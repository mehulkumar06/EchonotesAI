"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import type { BoardColumn, TaskPriority } from "@/types/task";
import { CalendarPlus, Loader2 } from "lucide-react";

type NoteOpt = { id: number; filename: string };

const COLUMNS: { value: BoardColumn; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TaskPlanner({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [column, setColumn] = useState<BoardColumn>("todo");
  const [noteId, setNoteId] = useState<string>("none");
  const [notes, setNotes] = useState<NoteOpt[]>([]);
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getNotes();
        const list = (res.data as NoteOpt[]).filter(
          (n) => n.filename !== "__manual_tasks__"
        );
        if (!cancelled) setNotes(list);
      } catch {
        if (!cancelled) setNotes([]);
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setLoading(true);
    try {
      const body = {
        task: t,
        priority,
        assignee: assignee.trim() || null,
        board_column: column,
        deadline: deadline.trim() || null,
      };
      if (noteId !== "none") body.note_id = Number(noteId);
      await apiClient.createTask(body);
      onCreated();
      setTitle("");
      setDeadline("");
      setAssignee("");
      setPriority("medium");
      setColumn("todo");
      setNoteId("none");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-indigo-400" />
          Task planner
        </CardTitle>
        <p className="text-sm text-neutral-500 font-normal">
          Add tasks with priority, assignee, deadline, and Kanban column. Leave
          meeting unlinked to store under your personal backlog.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3 space-y-2">
            <Label htmlFor="task-title">Task</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-neutral-950/80 border-neutral-800"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TaskPriority)}
            >
              <SelectTrigger className="bg-neutral-950/80 border-neutral-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kanban column</Label>
            <Select
              value={column}
              onValueChange={(v) => setColumn(v as BoardColumn)}
            >
              <SelectTrigger className="bg-neutral-950/80 border-neutral-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-neutral-950/80 border-neutral-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Name or team role"
              className="bg-neutral-950/80 border-neutral-800"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Link to meeting note (optional)</Label>
            <Select value={noteId} onValueChange={setNoteId} disabled={notesLoading}>
              <SelectTrigger className="bg-neutral-950/80 border-neutral-800">
                <SelectValue placeholder={notesLoading ? "Loading notes…" : "No link"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No meeting link</SelectItem>
                {notes.map((n) => (
                  <SelectItem key={n.id} value={String(n.id)}>
                    {n.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Add task"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
