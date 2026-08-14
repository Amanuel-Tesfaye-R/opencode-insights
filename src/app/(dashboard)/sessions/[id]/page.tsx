import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FolderOpen,
  Gauge,
  Plus,
  Minus,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { SessionTimeline } from "@/components/sections/session-timeline";
import {
  getSessionById,
  getSessionMessages,
  getSessionTodos,
} from "@/lib/queries";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatTokens,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = getSessionById(id);
  const title = session ? `${session.title} — OpenCode Usage Tracking` : "Session Detail — OpenCode Usage Tracking";
  const description = session
    ? `Full breakdown of AI coding session: ${session.title}. ${formatNumber(session.messageCount)} messages, ${formatTokens(session.tokensInput + session.tokensOutput + session.tokensReasoning + session.tokensCacheRead)} tokens, ${formatNumber(session.toolCount)} tool calls.`
    : "Full breakdown of an AI coding session with messages, tool calls, files changed, and token usage.";
  return { title, description };
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getSessionById(id);
  if (!session) notFound();

  const [messages, todos] = await Promise.all([
    getSessionMessages(id),
    getSessionTodos(id),
  ]);

  const tokenMax = Math.max(
    1,
    session.tokensInput,
    session.tokensOutput,
    session.tokensReasoning,
    session.tokensCacheRead
  );

  const tokenRows = [
    { label: "Input", value: session.tokensInput, color: "linear-gradient(90deg,#00abe0,#00deff)" },
    { label: "Output", value: session.tokensOutput, color: "linear-gradient(90deg,#dc751e,#f59e0b)" },
    { label: "Reasoning", value: session.tokensReasoning, color: "linear-gradient(90deg,#64748b,#94a3b8)" },
    { label: "Cache read", value: session.tokensCacheRead, color: "linear-gradient(90deg,#0a2b3c,#00abe0)" },
    { label: "Cache write", value: session.tokensCacheWrite, color: "linear-gradient(90deg,#334155,#64748b)" },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Sessions
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{session.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <ModelBadge model={session.modelId} />
            <span className="text-xs text-muted-foreground font-mono">
              {session.directoryName}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {formatDateTime(session.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-mono shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">
              Total tokens
            </p>
            <p className="text-lg font-bold text-gold">
              {formatTokens(
                session.tokensInput +
                  session.tokensOutput +
                  session.tokensReasoning +
                  session.tokensCacheRead
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">
              Cost
            </p>
            <p className="text-lg font-bold">${session.cost.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SessionTimeline messages={messages} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gauge className="h-4 w-4 text-accent" />
                Token usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenRows.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-mono font-medium">
                      {formatTokens(row.value)}
                    </span>
                  </div>
                  <ProgressBar
                    value={row.value}
                    max={tokenMax}
                    gradient={row.color}
                    className="h-1.5"
                  />
                </div>
              ))}
              <div className="border-t pt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-mono font-medium">
                  {formatNumber(session.messageCount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tool calls</span>
                <span className="font-mono font-medium">
                  {formatNumber(session.toolCount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent" />
                Session info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 py-1.5">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-right">
                  {formatDateTime(session.createdAt)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium text-right">
                  {formatDateTime(session.updatedAt)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium font-mono">
                  {formatDuration(session.durationMs)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <span className="text-muted-foreground">Agent</span>
                <span className="font-medium">{session.agent}</span>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium font-mono text-right">
                  {session.modelId}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <span className="text-muted-foreground shrink-0">Directory</span>
                <span className="font-medium font-mono text-right text-xs break-all">
                  {session.directory}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FolderOpen className="h-4 w-4 text-accent" />
                Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-ok">
                    <Plus className="h-3.5 w-3.5" />
                    {formatNumber(session.additions)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    Additions
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-err">
                    <Minus className="h-3.5 w-3.5" />
                    {formatNumber(session.deletions)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    Deletions
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="text-sm font-bold">{formatNumber(session.filesChanged)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    Files
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {todos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-accent" />
                  Todos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {todos.map((todo, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {todo.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-ok" />
                      ) : (
                        <Circle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          todo.status === "completed"
                            ? "text-muted-foreground line-through"
                            : ""
                        }
                      >
                        {todo.content}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
