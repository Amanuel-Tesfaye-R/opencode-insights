import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { formatDate, formatNumber, formatTokens } from "@/lib/format";
import type { SessionSummary } from "@/lib/types";

export function HeaviestSessions({
  sessions,
  limit = 5,
}: {
  sessions: SessionSummary[];
  limit?: number;
}) {
  const tokensOf = (s: SessionSummary) =>
    s.tokensInput +
    s.tokensOutput +
    s.tokensReasoning +
    s.tokensCacheRead;
  const maxTokens = Math.max(1, ...sessions.map(tokensOf));
  const shown = sessions.slice(0, limit);
  return (
    <Card className="flex flex-col animate__animated animate__fadeInUp animate-delay-3">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent" />
              Heaviest sessions
            </CardTitle>
            <CardDescription className="mt-1">
              Most tokens consumed, incl. cache
            </CardDescription>
          </div>
          <Link
            href="/sessions"
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {shown.map((s, i) => {
            const tokens = tokensOf(s);
            return (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}`}
                  className="group block rounded-lg border border-transparent p-1.5 -m-1.5 transition-colors hover:border-border hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <span className="text-sm font-medium truncate block group-hover:text-accent transition-colors">
                        <span className="text-muted-foreground font-mono mr-1.5">
                          #{i + 1}
                        </span>
                        {s.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(s.createdAt)} | {formatNumber(s.messageCount)} msgs
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-gold shrink-0 ml-2">
                      {formatTokens(tokens)}
                    </span>
                  </div>
                  <ProgressBar
                    value={tokens}
                    max={maxTokens}
                    gradient="linear-gradient(90deg, #00abe0, #00deff)"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
