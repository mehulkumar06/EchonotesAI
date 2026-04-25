"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import type { TaskAnalyticsSummary } from "@/types/task";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskAnalyticsPanel() {
  const [data, setData] = useState<TaskAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiClient.getTaskAnalytics();
      setData(res.data as TaskAnalyticsSummary);
    } catch {
      setErr("Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardContent className="py-16 flex justify-center text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardContent className="py-12 text-center text-neutral-500">{err}</CardContent>
      </Card>
    );
  }

  const assigneeRows = Object.entries(data.by_assignee).sort(
    (a, b) => b[1].total - a[1].total
  );

  const maxAssignee = Math.max(
    1,
    ...assigneeRows.map(([, v]) => v.total)
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Total tasks"
          value={data.total_tasks}
          sub="All time"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completion rate"
          value={`${data.completion_rate}%`}
          sub={`${data.completed_tasks} done`}
        />
        <StatCard
          icon={TrendingUp}
          label="Completed (7 days)"
          value={data.completed_last_7_days}
          sub={`${data.created_last_7_days} created`}
        />
        <StatCard
          icon={Clock}
          label="Avg. days to complete"
          value={
            data.avg_days_to_complete != null
              ? String(data.avg_days_to_complete)
              : "—"
          }
          sub={`${data.overdue_count} overdue now`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-neutral-100">
              <Users className="h-4 w-4 text-indigo-400" />
              Team / assignee load
            </CardTitle>
            <p className="text-xs text-neutral-500 font-normal">
              Task counts and completions per assignee (or Unassigned).
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {assigneeRows.length === 0 ? (
              <p className="text-sm text-neutral-500">No assignee data yet.</p>
            ) : (
              assigneeRows.map(([name, v]) => (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span className="truncate pr-2">{name}</span>
                    <span>
                      {v.completed}/{v.total} done
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
                      style={{ width: `${(v.total / maxAssignee) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-neutral-100">
              Priority & Kanban distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                By priority
              </h4>
              <ul className="space-y-2 text-sm">
                {Object.entries(data.by_priority).map(([p, n]) => (
                  <li key={p} className="flex justify-between text-neutral-300">
                    <span className="capitalize">{p}</span>
                    <span className="text-neutral-500">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                By column
              </h4>
              <ul className="space-y-2 text-sm">
                {["backlog", "todo", "in_progress", "done"].map((c) => (
                  <li key={c} className="flex justify-between text-neutral-300">
                    <span className="capitalize">{c.replace("_", " ")}</span>
                    <span className="text-neutral-500">
                      {data.by_column[c] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          Refresh analytics
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <Card className="border-neutral-800 bg-neutral-900/50">
      <CardContent className="pt-5 pb-4">
        <Icon className={cn("h-5 w-5 text-indigo-400 mb-2")} />
        <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-neutral-100 mt-1">{value}</p>
        <p className="text-xs text-neutral-600 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
