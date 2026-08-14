import Link from "next/link";
import { CheckCircle2, Circle, Loader2, Ban, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { formatNumber, formatDay } from "@/lib/format";
import type { TodoRow } from "@/lib/types";

const STATUS_META: Record<string, { icon: typeof Circle; className: string }> = {
  completed: { icon: CheckCircle2, className: "text-ok" },
  in_progress: { icon: Loader2, className: "text-accent" },
  pending: { icon: Circle, className: "text-muted-foreground" },
  cancelled: { icon: Ban, className: "text-err" },
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-err",
  medium: "bg-warn",
  low: "bg-ok",
  normal: "bg-muted-foreground",
};

export function TodosCard({
  todos,
  filter,
}: {
  todos: TodoRow[];
  filter: string;
}) {
  const filtered =
    filter === "all"
      ? todos
      : todos.filter((t) => t.status === filter || t.priority === filter);

  const completed = todos.filter((t) => t.status === "completed").length;
  const completionRate = todos.length > 0 ? (completed / todos.length) * 100 : 0;
  const pending = todos.filter((t) => t.status === "pending").length;
  const inProgress = todos.filter((t) => t.status === "in_progress").length;

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In progress" },
    { value: "high", label: "High priority" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Completion</p>
          <p className="text-2xl font-bold font-mono mt-1">{completionRate.toFixed(0)}%</p>
          <div className="mt-2">
            <ProgressBar value={completed} max={Math.max(1, todos.length)} />
          </div>
          <p className="text-[11px] text-muted-foreground font-mono mt-1.5">
            {formatNumber(completed)} of {formatNumber(todos.length)} tasks done
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold font-mono mt-1">{formatNumber(pending)}</p>
          <p className="text-[11px] text-muted-foreground font-mono mt-1.5">
            awaiting work
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">In progress</p>
          <p className="text-2xl font-bold font-mono mt-1">{formatNumber(inProgress)}</p>
          <p className="text-[11px] text-muted-foreground font-mono mt-1.5">
            actively being worked
          </p>
        </Card>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/todos" : `/todos?status=${f.value}`}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No tasks match this filter.
        </Card>
      ) : (
        <Card className="animate__animated animate__fadeInUp">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-accent" />
              Tasks
            </CardTitle>
            <CardDescription className="mt-1">
              {formatNumber(filtered.length)} tasks in this view
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60">
            {filtered.map((t) => {
              const meta = STATUS_META[t.status] ?? STATUS_META.pending;
              const Icon = meta.icon;
              return (
                <div key={`${t.sessionId}-${t.position}`} className="flex items-start gap-3 py-3">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.className}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm break-words">{t.content}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted-foreground">
                      <Link
                        href={`/sessions/${t.sessionId}`}
                        className="font-medium text-primary hover:underline truncate max-w-[240px]"
                      >
                        {t.sessionTitle}
                      </Link>
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[t.priority] ?? PRIORITY_DOT.normal}`}
                        />
                        {t.priority}
                      </span>
                      <span>updated {formatDay(t.timeUpdated)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
