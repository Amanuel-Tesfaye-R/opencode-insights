"use client";

import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GatewayWallArt } from "@/components/ui/gateway-wall-art";
import { useGateway, type GatewayCheck } from "@/lib/use-gateway";
import { formatTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_META = {
  healthy: {
    label: "Wall standing",
    headline: "Free tier is open",
    description:
      "The gateway wall is up and healthy. Zen free models are responding to probes and your requests pass through.",
    dot: "bg-ok",
    text: "text-emerald-600 dark:text-emerald-400",
    badge: "border-emerald-500/30",
  },
  cracked: {
    label: "Wall breached",
    headline: "Free usage limit reached",
    description:
      "The wall has cracked. The anonymous free tier has hit its rate limit and is refusing requests. The wall usually mends itself after the cooldown window rolls over.",
    dot: "bg-err",
    text: "text-red-600 dark:text-red-400",
    badge: "border-red-500/30",
  },
  error: {
    label: "Status unknown",
    headline: "Gateway unreachable",
    description:
      "The probe could not reach the gateway. This may be a network issue or the dashboard's probe route failed.",
    dot: "bg-warn",
    text: "text-amber-600 dark:text-amber-400",
    badge: "border-amber-500/30",
  },
} as const;

function historyColor(check: GatewayCheck) {
  if (check.state === "healthy") return "bg-ok";
  if (check.state === "cracked") return "bg-err";
  return "bg-warn";
}

export function GatewayWallPanel() {
  const { probe, history, loading, check } = useGateway(30_000);

  const state = probe?.state ?? "error";
  const meta = STATUS_META[state];
  const healthyChecks = history.filter((c) => c.state === "healthy").length;
  const uptime =
    history.length > 0 ? Math.round((healthyChecks / history.length) * 100) : null;

  return (
    <Card className="relative overflow-hidden animate__animated animate__fadeInUp">
      <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-gold/70 via-gold/30 to-transparent" />
      <div className="pointer-events-none absolute -top-16 right-10 h-40 w-40 rounded-full bg-accent/10 blur-[70px]" />

      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Gateway Wall
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium text-foreground",
                meta.badge
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  meta.dot,
                  !probe && "animate-pulse"
                )}
              />
              {loading ? "Probing..." : meta.label}
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Live status of the Zen free tier wall, probed from your machine.
          </p>
        </div>
        <button
          type="button"
          onClick={() => check({ force: true })}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Probe now
        </button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 rounded-xl border border-border bg-muted/20 p-3">
            <GatewayWallArt state={state} />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className={cn("text-lg font-bold tracking-tight", meta.text)}>
                {meta.headline}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {meta.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Status code" value={probe ? String(probe.statusCode ?? "n/a") : "..."} />
              <Stat label="Latency" value={probe ? `${probe.latencyMs ?? "n/a"}ms` : "..."} />
              <Stat label="Last checked" value={probe ? timeAgo(probe.checkedAt) : "..."} />
              <Stat
                label="Uptime (window)"
                value={uptime !== null ? `${uptime}%` : "..."}
                sub={history.length > 0 ? `${history.length} probes` : "no probes yet"}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ping history
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  last {history.length} probes
                </p>
              </div>
              <div className="flex items-end gap-1 h-8">
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-mono">
                    waiting for probes...
                  </p>
                ) : (
                  history.map((c, i) => (
                    <span
                      key={`${c.at}-${i}`}
                      title={`${formatTime(c.at)}: ${c.state} (${c.statusCode ?? "n/a"})`}
                      className={cn(
                        "flex-1 rounded-sm transition-all duration-300 h-8 opacity-90 hover:opacity-100",
                        historyColor(c)
                      )}
                    />
                  ))
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-ok" /> healthy
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-err" /> breached
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-warn" /> error
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              The wall is shared by every anonymous client on your network IP. A
              cracked wall usually mends itself after the cooldown window. When
              it does, the wall graphic mends and probes start passing again.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-lg font-bold font-mono mt-1">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
