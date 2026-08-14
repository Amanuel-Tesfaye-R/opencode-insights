import { ArrowUpRight, Wrench } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { ToolBreakdown } from "@/lib/types";

export function ToolUsage({
  tools,
  limit = 6,
}: {
  tools: ToolBreakdown[];
  limit?: number;
}) {
  const maxCalls = Math.max(1, ...tools.map((t) => t.calls));
  const total = tools.reduce((a, t) => a + t.calls, 0);
  const shown = tools.slice(0, limit);
  return (
    <Card className="flex flex-col animate__animated animate__fadeInUp animate-delay-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-accent" />
              Tool usage
            </CardTitle>
            <CardDescription className="mt-1">
              {formatNumber(total)} calls across {formatNumber(tools.length)} tools
            </CardDescription>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {shown.map((t) => {
          const pct = Math.round((t.calls / total) * 100);
          return (
            <Link
              key={t.tool}
              href={`/tools?tool=${encodeURIComponent(t.tool)}`}
              className="group block rounded-lg border border-transparent p-1.5 transition-colors hover:border-border hover:bg-muted/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium font-mono group-hover:text-accent transition-colors">
                  {t.tool}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatNumber(t.calls)} ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(t.calls / maxCalls) * 100}%`,
                    background: "linear-gradient(90deg, #00abe0, #00deff)",
                  }}
                />
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <StatusDot status="completed" /> {formatNumber(t.completed)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <StatusDot status="error" /> {formatNumber(t.error)}
                </span>
                {t.pending > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <StatusDot status="pending" /> {formatNumber(t.pending)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
