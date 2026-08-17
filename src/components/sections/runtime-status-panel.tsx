"use client";

import { KeyRound, Languages, RefreshCw, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { useRuntime } from "@/lib/use-runtime";
import { formatCost, formatNumber, formatTokens, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const PROVIDER_LABEL: Record<string, string> = {
  opencode: "OpenCode Zen",
  openrouter: "OpenRouter",
  "github-copilot": "GitHub Copilot",
};

export function RuntimeStatusPanel() {
  const { info, loading, refresh } = useRuntime(10_000);

  const session = info?.session ?? null;
  const ctx = session?.context ?? null;
  const ctxPct = ctx?.pct ?? 0;
  const ctxColor =
    ctxPct >= 90 ? "text-err" : ctxPct >= 70 ? "text-warn" : "text-ok";
  const ctxBar =
    ctxPct >= 90
      ? "linear-gradient(90deg, #ef4444, #dc2626)"
      : ctxPct >= 70
        ? "linear-gradient(90deg, #eab308, #dc751e)"
        : "linear-gradient(90deg, #00abe0, #00deff)";

  return (
    <Card className="animate__animated animate__fadeInUp">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-accent">Runtime status</span>
              {session?.active && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
                  live
                </span>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              What the TUI reports right now, from real config and DB data.
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* API key retrieval */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <KeyRound className="h-3.5 w-3.5 text-accent" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              API key retrieval
            </h3>
          </div>
          <div className="space-y-2">
            {info?.providers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      p.configured ? "bg-ok shadow-[0_0_6px_rgba(34,197,94,0.7)]" : "bg-muted-foreground/40"
                    )}
                  />
                  <span className="text-sm font-medium">
                    {PROVIDER_LABEL[p.id] ?? p.id}
                  </span>
                  {p.type && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
                      {p.type}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-mono",
                    p.configured ? "text-emerald-500" : "text-muted-foreground"
                  )}
                >
                  {p.configured ? "configured" : "not set"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Context window */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Context</span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-mono",
                  ctxPct >= 90
                    ? "border-red-500/30 text-red-500"
                    : ctxPct >= 70
                      ? "border-amber-500/30 text-amber-500"
                      : "border-emerald-500/30 text-emerald-500"
                )}
              >
                {session ? `${ctxPct}% used` : "—"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {ctx ? `${formatTokens(ctx.limit)} limit` : ""}
            </span>
          </div>
          {session ? (
            <>
              <ProgressBar value={ctx?.tokens ?? 0} max={ctx?.limit ?? 1} gradient={ctxBar} />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground font-mono">
                  {session.modelId}
                  <span className="text-muted-foreground/60"> · {session.providerId}</span>
                </span>
                <span className={cn("text-sm font-bold font-mono", ctxColor)}>
                  {formatTokens(ctx?.tokens ?? 0)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                {session.title}
              </p>
              <p className="text-[10px] text-muted-foreground/70 font-mono">
                updated {timeAgo(session.updatedAt)}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground font-mono">
              no session data yet
            </p>
          )}
        </div>

        {/* Cost + LSP in a row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Spent
              </span>
            </div>
            <p className="text-lg font-bold font-mono">
              {session ? formatCost(session.cost) : "$0.00"}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {session
                ? `in ${formatTokens(session.tokens.input)} out ${formatTokens(session.tokens.output)}`
                : "no session"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Languages className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                LSP
              </span>
            </div>
            <p
              className={cn(
                "text-lg font-bold",
                info?.lsp.enabled ? "text-emerald-500" : "text-muted-foreground"
              )}
            >
              {info?.lsp.enabled ? "enabled" : "disabled"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {info?.lsp.note ?? "checking..."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
