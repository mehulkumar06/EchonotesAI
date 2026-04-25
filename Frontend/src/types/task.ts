export type BoardColumn = "backlog" | "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface EchoTask {
  id: number;
  task: string;
  deadline: string | null;
  status: string;
  note_id?: number;
  note_filename?: string | null;
  priority?: string;
  assignee?: string | null;
  board_column?: string;
  position_x?: number | null;
  position_y?: number | null;
  completed_at?: string | null;
  created_at?: string;
}

export interface TaskAnalyticsSummary {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  active_tasks: number;
  overdue_count: number;
  by_assignee: Record<string, { total: number; completed: number }>;
  by_priority: Record<string, number>;
  by_column: Record<string, number>;
  completed_last_7_days: number;
  created_last_7_days: number;
  avg_days_to_complete: number | null;
}

export type TaskPatch = Partial<{
  status: string;
  board_column: BoardColumn;
  priority: TaskPriority;
  assignee: string | null;
  deadline: string | null;
  task: string;
  position_x: number;
  position_y: number;
}>;
