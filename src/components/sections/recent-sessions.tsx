import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelBadge } from "@/components/ui/badge";
import { formatTokens, timeAgo } from "@/lib/format";
import type { SessionSummary } from "@/lib/types";

export function RecentSessions({ sessions }: { sessions: SessionSummary[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent sessions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-1">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/sessions/${s.id}`}
                className="group flex items-start gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/30"
              >
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                    {s.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ModelBadge model={s.modelId} index={0} />
                    <span className="text-[11px] text-muted-foreground">
                      {timeAgo(s.createdAt)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatTokens(
                        s.tokensInput +
                          s.tokensOutput +
                          s.tokensReasoning +
                          s.tokensCacheRead
                      )}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 mt-1 shrink-0 text-muted-foreground/40 group-hover:text-accent" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
