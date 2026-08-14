import { Card, CardContent } from "@/components/ui/card";
import { ModelBadge } from "@/components/ui/badge";
import { formatCost, formatNumber, formatTokens, timeAgo } from "@/lib/format";
import type { ModelBreakdown } from "@/lib/types";

const MIX = [
  { key: "tokensInput", label: "in", color: "#00abe0" },
  { key: "tokensOutput", label: "out", color: "#00deff" },
  { key: "tokensReasoning", label: "reason", color: "#dc751e" },
  { key: "tokensCacheRead", label: "cache", color: "#22c55e" },
] as const;

export function ModelCards({ models }: { models: ModelBreakdown[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {models.map((m, i) => {
        const total = m.tokensInput + m.tokensOutput + m.tokensReasoning + m.tokensCacheRead;
        return (
          <Card key={m.modelId} className="card-lift animate__animated animate__fadeInUp"
            style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <ModelBadge model={m.modelId} index={i} />
                  <p className="text-[11px] text-muted-foreground font-mono mt-1.5">
                    {m.providerId}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold font-mono leading-none">
                    {formatNumber(m.sessions)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">sessions</p>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden flex">
                {MIX.map((seg) => {
                  const pct = total > 0 ? (m[seg.key] / total) * 100 : 0;
                  if (pct < 0.5) return null;
                  return (
                    <div
                      key={seg.key}
                      style={{ width: `${pct}%`, backgroundColor: seg.color }}
                      title={`${seg.label} ${formatTokens(m[seg.key])}`}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono">
                {MIX.map((seg) => (
                  <div key={seg.key} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: seg.color }} />
                      {seg.label}
                    </span>
                    <span className="truncate">{formatTokens(m[seg.key])}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <span className="text-[11px] text-muted-foreground">
                  {formatTokens(total)} total · {formatCost(m.cost)}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {m.lastActive ? timeAgo(m.lastActive) : "never"}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
