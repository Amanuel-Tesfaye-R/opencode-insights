import { Coins, MessagesSquare, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCost, formatNumber, formatTokens } from "@/lib/format";
import type { OverviewStats } from "@/lib/types";

export function HeroTotals({
  stats,
  rangeLabel,
}: {
  stats: OverviewStats;
  rangeLabel: string;
}) {
  const total =
    stats.tokensInput +
    stats.tokensOutput +
    stats.tokensReasoning +
    stats.tokensCacheRead;
  const newTokens = stats.tokensInput + stats.tokensOutput;
  const segments = [
    { label: "Input", value: stats.tokensInput, color: "#00abe0" },
    { label: "Output", value: stats.tokensOutput, color: "#dc751e" },
    { label: "Reasoning", value: stats.tokensReasoning, color: "#94a3b8" },
    { label: "Cache read", value: stats.tokensCacheRead, color: "#00deff" },
  ];
  const minWidth = 1.5; // % so tiny segments stay visible
  const cacheX =
    newTokens > 0 ? (stats.tokensCacheRead / newTokens).toFixed(1) : "0";
  const cachePct =
    total > 0 ? Math.round((stats.tokensCacheRead / total) * 100) : 0;

  return (
    <Card className="relative overflow-hidden animate__animated animate__fadeInUp">
      <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-gold/70 via-gold/30 to-transparent" />
      <div className="pointer-events-none absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-accent/10 blur-[90px]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total tokens used
          </p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl sm:text-5xl font-bold tracking-tight font-mono text-foreground">
              {formatTokens(total)}
            </span>
            <span className="text-sm text-muted-foreground font-mono">
              {rangeLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {formatNumber(total)} tokens across {formatNumber(stats.sessions)} sessions
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted/60 ring-1 ring-foreground/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.18)]">
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    width: `${Math.max(seg.value > 0 ? minWidth : 0, (seg.value / total) * 100)}%`,
                    background: `linear-gradient(180deg, ${seg.color}, color-mix(in oklab, ${seg.color} 55%, black))`,
                    boxShadow:
                      seg.value > 0
                        ? `0 0 10px ${seg.color}66, inset 0 1px 0 rgba(255,255,255,0.18)`
                        : undefined,
                  }}
                  title={`${seg.label}: ${formatTokens(seg.value)}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-mono">
              {segments.map((seg) => (
                <span key={seg.label} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-sm shrink-0"
                    style={{ background: seg.color }}
                  />
                  {seg.label} {formatTokens(seg.value)}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-muted-foreground/70">
                Cache read is {cacheX}x new tokens ({cachePct}% of total)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:border-l md:border-border md:pl-6 content-center">
          <div>
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
              <MessagesSquare className="h-3 w-3" />
              Sessions
            </p>
            <p className="text-2xl font-bold font-mono mt-1">{formatNumber(stats.sessions)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
              <Coins className="h-3 w-3" />
              Messages
            </p>
            <p className="text-2xl font-bold font-mono mt-1">{formatNumber(stats.messages)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
              <Timer className="h-3 w-3" />
              Cost
            </p>
            <p className="text-2xl font-bold font-mono mt-1">{formatCost(stats.cost)}</p>
          </div>
          <p className="col-span-3 text-[11px] text-muted-foreground mt-1">
            {formatNumber(stats.daysActive)} active days in range
          </p>
        </div>
      </div>
    </Card>
  );
}
