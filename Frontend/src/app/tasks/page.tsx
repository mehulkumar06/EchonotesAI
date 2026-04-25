"use client";

import { useState, useEffect, useCallback } from "react";
import TaskList from "@/components/TaskList";
import TaskPlanner from "@/components/tasks/TaskPlanner";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import DrawioWhiteboard from "@/components/tasks/DrawioWhiteboard";
import TaskMindMap from "@/components/tasks/TaskMindMap";
import TaskAnalyticsPanel from "@/components/tasks/TaskAnalyticsPanel";
import { apiClient } from "@/lib/api";
import type { EchoTask } from "@/types/task";
import {
  CheckSquare,
  ListFilter,
  AlertCircle,
  Clock,
  CheckCircle2,
  RotateCcw,
  CalendarClock,
  LayoutGrid,
  PenLine,
  Kanban,
  Map,
  BarChart3,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_TASKS: EchoTask[] = [
  {
    id: 201,
    task: "Review ensuring mobile responsiveness is working",
    deadline: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    status: "pending",
    note_id: 101,
    note_filename: "Weekly_Sync_Design_Review.webm",
    priority: "high",
    assignee: "Alex",
    board_column: "in_progress",
    created_at: new Date().toISOString(),
  },
  {
    id: 202,
    task: "Update the API documentation for the new endpoints",
    deadline: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    status: "pending",
    note_id: 101,
    note_filename: "Weekly_Sync_Design_Review.webm",
    priority: "medium",
    board_column: "todo",
    created_at: new Date().toISOString(),
  },
  {
    id: 203,
    task: "Schedule a follow-up meeting with the design lead",
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    status: "pending",
    note_id: 101,
    note_filename: "Weekly_Sync_Design_Review.webm",
    priority: "low",
    board_column: "backlog",
    created_at: new Date().toISOString(),
  },
  {
    id: 204,
    task: "Implement granular filters for user activity reports",
    deadline: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    status: "pending",
    note_id: 102,
    note_filename: "Client_Feedback_Q1_Roadmap.mp3",
    priority: "urgent",
    assignee: "Jamie",
    board_column: "todo",
    created_at: new Date().toISOString(),
  },
  {
    id: 205,
    task: "Export user data to CSV feature",
    deadline: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    status: "pending",
    note_id: 102,
    note_filename: "Client_Feedback_Q1_Roadmap.mp3",
    board_column: "backlog",
    created_at: new Date().toISOString(),
  },
  {
    id: 206,
    task: "Define push notification strategy",
    deadline: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
    status: "pending",
    note_id: 103,
    note_filename: "Project_Kickoff_Mobile_App.wav",
    priority: "medium",
    board_column: "in_progress",
    created_at: new Date().toISOString(),
  },
  {
    id: 207,
    task: "Draft initial authentication flow diagrams",
    deadline: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    status: "completed",
    note_id: 103,
    note_filename: "Project_Kickoff_Mobile_App.wav",
    priority: "low",
    board_column: "done",
    created_at: new Date().toISOString(),
  },
];

type Section =
  | "overview"
  | "planner"
  | "kanban"
  | "whiteboard"
  | "map"
  | "analytics";

function isDone(t: EchoTask) {
  return t.status === "completed" || t.board_column === "done";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<EchoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "overdue" | "due-soon" | "completed">("pending");
  const [section, setSection] = useState<Section>("overview");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getTasks();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setTasks(res.data as EchoTask[]);
      } else {
        setTasks(MOCK_TASKS);
      }
    } catch {
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const isOverdue = (deadline: string | null, t: EchoTask) => {
    if (!deadline || isDone(t)) return false;
    const d = new Date(deadline);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d < now;
  };

  const getFilteredTasks = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const next7Days = new Date(now);
    next7Days.setDate(now.getDate() + 7);

    const isDueSoon = (deadline: string | null) => {
      if (!deadline) return false;
      const d = new Date(deadline);
      return d >= now && d <= next7Days;
    };

    let filtered = tasks;

    if (filter === "completed") {
      filtered = tasks.filter(isDone);
    } else {
      filtered = tasks.filter((t) => !isDone(t));
      if (filter === "overdue") {
        filtered = filtered.filter((t) => isOverdue(t.deadline, t));
      } else if (filter === "due-soon") {
        filtered = filtered.filter((t) => isDueSoon(t.deadline));
      }
    }

    return filtered.sort((a, b) => {
      if (isDone(a) && isDone(b)) return b.id - a.id;
      const aOverdue = isOverdue(a.deadline, a);
      const bOverdue = isOverdue(b.deadline, b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return b.id - a.id;
    });
  };

  const handleTaskUpdate = () => fetchTasks();

  const filteredTasks = getFilteredTasks();

  const counts = {
    pending: tasks.filter((t) => !isDone(t)).length,
    overdue: tasks.filter((t) => isOverdue(t.deadline, t)).length,
    dueSoon: tasks.filter((t) => {
      if (isDone(t) || !t.deadline) return false;
      const d = new Date(t.deadline);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const next7 = new Date(now);
      next7.setDate(now.getDate() + 7);
      return d >= now && d <= next7;
    }).length,
    completed: tasks.filter(isDone).length,
  };

  const sections: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "planner", label: "Planner", icon: ListTodo },
    { id: "kanban", label: "Kanban", icon: Kanban },
    { id: "whiteboard", label: "Whiteboard", icon: PenLine },
    { id: "map", label: "Task map", icon: Map },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Task management</h1>
          <p className="text-neutral-400 mt-1">
            Plan work, run a Kanban board, sketch in draw.io, and track team performance.
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="self-start p-2 hover:bg-neutral-800 rounded-full transition-colors"
          title="Refresh tasks"
        >
          <RotateCcw className={`h-5 w-5 text-neutral-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="flex flex-wrap gap-2 p-1 bg-neutral-900/50 rounded-lg border border-neutral-800">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              section === id
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {section === "planner" && (
        <TaskPlanner
          onCreated={() => {
            fetchTasks();
          }}
        />
      )}

      {section === "kanban" && (
        <KanbanBoard tasks={tasks} onUpdate={handleTaskUpdate} />
      )}

      {section === "whiteboard" && <DrawioWhiteboard />}

      {section === "map" && (
        <TaskMindMap tasks={tasks} onUpdate={handleTaskUpdate} />
      )}

      {section === "analytics" && <TaskAnalyticsPanel />}

      {(section === "overview" || section === "planner") && (
        <>
          <div className="flex gap-2 p-1 bg-neutral-900/50 rounded-lg w-fit border border-neutral-800 flex-wrap">
            <FilterTab
              active={filter === "pending"}
              onClick={() => setFilter("pending")}
              label="All Pending"
              count={counts.pending}
              icon={ListFilter}
            />
            <FilterTab
              active={filter === "due-soon"}
              onClick={() => setFilter("due-soon")}
              label="Due Soon"
              count={counts.dueSoon}
              icon={CalendarClock}
              activeClass="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            />
            <FilterTab
              active={filter === "overdue"}
              onClick={() => setFilter("overdue")}
              label="Overdue"
              count={counts.overdue}
              icon={AlertCircle}
              activeClass="bg-red-500/10 text-red-500 hover:bg-red-500/20"
            />
            <FilterTab
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
              label="Completed"
              count={counts.completed}
              icon={CheckCircle2}
            />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredTasks.length > 0 ? (
              <TaskList tasks={filteredTasks} onTaskUpdate={handleTaskUpdate} />
            ) : (
              <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                <CheckSquare className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-neutral-300">No tasks found</h3>
                <p className="text-neutral-500 max-w-sm mx-auto mt-1">
                  {filter === "completed"
                    ? "You haven't completed any tasks yet."
                    : "You're all caught up, or add tasks from the Planner tab."}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {section === "overview" && (
        <p className="text-xs text-neutral-600">
          Tip: open <span className="text-neutral-400">Kanban</span> to drag tasks between
          columns, <span className="text-neutral-400">Whiteboard</span> for draw.io, and{" "}
          <span className="text-neutral-400">Analytics</span> for completion trends.
        </p>
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
  icon: Icon,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: React.ElementType;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
        active
          ? activeClass || "bg-neutral-800 text-white shadow-sm"
          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.5 rounded-full text-xs",
            active ? "bg-black/20" : "bg-neutral-800 text-neutral-300"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
