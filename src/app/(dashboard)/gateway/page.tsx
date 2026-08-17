"use client";

import { Activity, AlertTriangle, Info, RefreshCw, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GatewayWallArt } from "@/components/ui/gateway-wall-art";
import { RuntimeStatusPanel } from "@/components/sections/runtime-status-panel";
import { useGateway } from "@/lib/use-gateway";
import { formatTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_META = {
  healthy: {
    label: "Wall standing",
    headline: "Free tier is open",
    description:
      "The gateway wall is up and healthy. Zen free models are responding to probes.",
    dot: "bg-ok",
    text: "text-emerald-600 dark:text-emerald-400",
    badge: "border-emerald-500/30",
    icon: ShieldCheck,
  },
  cracked: {
    label: "Wall breached",
    headline: "Free usage limit reached",
    description:
      "The anonymous free tier is currently refusing requests with a 429. Probes resume automatically as the cooldown window rolls over.",
    dot: "bg-err",
    text: "text-red-600 dark:text-red-400",
    badge: "border-red-500/30",
    icon: AlertTriangle,
  },
  error: {
    label: "Status unknown",
    headline: "Gateway unreachable",
    description:
      "The probe could not reach the gateway. This is usually a network issue, not a usage limit.",
    dot: "bg-warn",
    text: "text-amber-600 dark:text-amber-400",
    badge: "border-amber-500/30",
    icon: Activity,
  },
} as const;

function historyColor(state: string) {
  if (state === "healthy") return "bg-ok";
  if (state === "cracked") return "bg-err";
  return "bg-warn";
}

export default function GatewayPage() {
  const { probe, history, loading, check } = useGateway(30_000);

  const state = probe?.state ?? "error";
  const meta = STATUS_META[state];
  const Icon = meta.icon;

  const healthyChecks = history.filter((c) => c.state === "healthy").length;
  const uptime = history.length > 0 ? Math.round((healthyChecks / history.length) * 100) : null;

  // Longest consecutive streak of healthy probes.
  let streak = 0;
  let best = 0;
  for (const c of history) {
    if (c.state === "healthy") {
      streak += 1;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }

  const lastCracked = [...history].reverse().find((c) => c.state === "cracked");
  const lastHealthy = [...history].reverse().find((c) => c.state === "healthy");

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 ring-1 ring-accent/30 shadow-[0_0_18px_rgba(0,222,255,0.15)]">
              <Icon className="h-5 w-5 text-accent" />
            </span>
            Gateway Wall
          </span>
        }
        description="Live status of the Zen free tier, probed from your machine every 30 seconds."
        actions={
          <button
            type="button"
            onClick={() => check({ force: true })}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Probe now
          </button>
        }
      />

      {/* Hero: wall art + headline stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="relative overflow-hidden h-full">
            <div
              className={cn(
                "absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r",
                state === "healthy"
                  ? "from-emerald-500/70 via-emerald-500/30"
                  : "from-red-500/70 via-red-500/30"
              )}
            />
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <GatewayWallArt state={state} />
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      meta.badge
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dot, !probe && "animate-pulse")} />
                    {loading ? "Probing..." : meta.label}
                  </span>
                  {probe && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      checked {timeAgo(probe.checkedAt)}
                    </span>
                  )}
                </div>
                <h2 className={cn("text-xl font-bold tracking-tight mt-2", meta.text)}>
                  {meta.headline}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {meta.description}
                </p>
                {probe?.message && probe.message !== meta.description && (
                  <p className="text-xs text-muted-foreground/80 mt-2 font-mono">
                    {probe.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Status code"
              value={probe ? String(probe.statusCode ?? "n/a") : "..."}
              tone={state === "healthy" ? "ok" : state === "cracked" ? "err" : "warn"}
            />
            <Stat
              label="Latency"
              value={probe ? `${probe.latencyMs ?? "n/a"}ms` : "..."}
              tone="plain"
            />
            <Stat
              label="Uptime (window)"
              value={uptime !== null ? `${uptime}%` : "..."}
              tone={uptime !== null && uptime >= 90 ? "ok" : uptime !== null && uptime >= 50 ? "warn" : "plain"}
              sub={history.length > 0 ? `${history.length} probes` : "no probes yet"}
            />
            <Stat
              label="Best streak"
              value={`${best}`}
              tone="plain"
              sub={best > 0 ? "consecutive healthy" : "no healthy streak yet"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <Row label="Last healthy" value={lastHealthy ? timeAgo(lastHealthy.at) : "never"} />
              <Row label="Last breach" value={lastCracked ? timeAgo(lastCracked.at) : "never"} />
              <Row label="Probe interval" value="30s" />
              <Row label="Probe model" value="deepseek-v4-flash-free" mono />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ping history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Ping history
          </CardTitle>
          <CardDescription>
            Every probe since this browser first loaded the page (persisted in localStorage).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground font-mono">waiting for probes...</p>
          ) : (
            <>
              <div className="flex items-end gap-[2px] h-24">
                {history.map((c, i) => (
                  <span
                    key={`${c.at}-${i}`}
                    title={`${formatTime(c.at)}: ${c.state} (${c.statusCode ?? "n/a"})`}
                    className={cn(
                      "flex-1 rounded-sm transition-all duration-300 h-full opacity-90 hover:opacity-100",
                      historyColor(c.state)
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-ok" /> healthy
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-err" /> breached
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-warn" /> error
                </span>
                <span className="ml-auto font-mono">{history.length} probes</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Runtime status (TUI mirror) */}
      <RuntimeStatusPanel />

      {/* Explainer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-accent" />
            What is the wall?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            OpenCode&apos;s default free tier (<span className="font-mono">opencode/*-free</span> models)
            is served anonymously — no API key, paid for by rate limits instead. The wall is that rate
            limit: each network shares a bucket, and when it empties, the gateway answers{" "}
            <span className="font-mono">429</span> until the cooldown window rolls over.
          </p>
          <p>
            This page probes the wall the same way opencode itself calls it — proper request,
            proper User-Agent — so the status you see here matches what the TUI experiences. A
            cracked wall here means your free-tier requests are being refused right now.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Note: the anonymous bucket is shared per network. If someone else on your office IP
            runs opencode on the free tier, they draw from the same bucket you do.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "ok" | "err" | "warn" | "plain";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-bold font-mono mt-1",
          tone === "ok" && "text-emerald-500",
          tone === "err" && "text-red-500",
          tone === "warn" && "text-amber-500",
          tone === "plain" && "text-foreground"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(mono && "font-mono")}>{value}</span>
    </div>
  );
}
