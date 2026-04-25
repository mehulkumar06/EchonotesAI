// src/components/TaskList.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Calendar, FileText } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EchoTask } from "@/types/task";

export type Task = EchoTask;

interface TaskListProps {
    tasks: Task[];
    onTaskUpdate?: () => void;
}

export default function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

    const toggleTaskStatus = async (taskId: number, currentStatus: string) => {
        if (updatingTaskId === taskId) return;
        setUpdatingTaskId(taskId);
        try {
            const newStatus = currentStatus === "pending" ? "completed" : "pending";
            // Optimistic update
            await apiClient.updateTaskStatus(taskId, newStatus);
            if (onTaskUpdate) {
                onTaskUpdate();
            }
        } catch (error) {
            console.error("Failed to update task:", error);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const isOverdue = (deadline: string | null, task: Task) => {
        if (!deadline || task.status === "completed" || task.board_column === "done")
            return false;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return deadlineDate < today;
    };

    const formatDate = (deadline: string | null) => {
        if (!deadline) return null;
        return new Date(deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                    Action Items
                </CardTitle>
            </CardHeader>
            <CardContent>
                {tasks && tasks.length > 0 ? (
                    <div className="space-y-3">
                        {tasks.map((task) => {
                            const overdue = isOverdue(task.deadline, task);
                            const completed =
                                task.status === "completed" || task.board_column === "done";

                            return (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
                                        completed
                                            ? "bg-neutral-900/30 border-neutral-800/50"
                                            : "bg-neutral-800/20 border-white/5 hover:bg-neutral-800/40 hover:border-white/10"
                                    )}
                                >
                                    <button
                                        onClick={() => toggleTaskStatus(task.id, task.status)}
                                        disabled={updatingTaskId === task.id}
                                        className={cn(
                                            "mt-0.5 shrink-0 transition-all duration-200 rounded-full",
                                            completed ? "text-green-500" : "text-neutral-500 hover:text-neutral-300"
                                        )}
                                    >
                                        {completed ? (
                                            <CheckCircle2 className="h-5 w-5 fill-current/10" />
                                        ) : (
                                            <Circle className="h-5 w-5" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className={cn(
                                            "text-sm leading-relaxed transition-colors",
                                            completed ? "text-neutral-500 line-through" : "text-neutral-200"
                                        )}>
                                            {task.task}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {(task.priority || task.assignee) && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {task.priority && (
                                                        <span
                                                            className={cn(
                                                                "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border",
                                                                task.priority === "urgent" &&
                                                                    "text-rose-400 bg-rose-500/10 border-rose-500/20",
                                                                task.priority === "high" &&
                                                                    "text-orange-400 bg-orange-500/10 border-orange-500/20",
                                                                task.priority === "low" &&
                                                                    "text-slate-400 bg-slate-500/10 border-slate-500/20",
                                                                (task.priority === "medium" || !task.priority) &&
                                                                    "text-indigo-300 bg-indigo-500/10 border-indigo-500/20"
                                                            )}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                    )}
                                                    {task.assignee && (
                                                        <span className="text-[10px] text-neutral-500">
                                                            @{task.assignee}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {task.deadline && (
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-xs font-medium rounded-full px-2 py-0.5 border",
                                                    overdue
                                                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                                                        : completed
                                                            ? "text-neutral-600 bg-neutral-900 border-neutral-800"
                                                            : "text-neutral-400 bg-neutral-900/50 border-neutral-800"
                                                )}>
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(task.deadline)}</span>
                                                    {overdue && <span className="text-[10px] uppercase tracking-wider font-bold ml-1">Overdue</span>}
                                                </div>
                                            )}

                                            {task.note_id && task.note_filename && (
                                                <Link
                                                    href={`/notes/${task.note_id}`}
                                                    className="flex items-center gap-1.5 text-xs text-indigo-400/80 hover:text-indigo-300 hover:underline decoration-indigo-500/30 underline-offset-2 transition-colors"
                                                >
                                                    <FileText className="h-3 w-3" />
                                                    <span className="truncate max-w-[150px]">{task.note_filename}</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-neutral-500 text-sm">No action items found.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
