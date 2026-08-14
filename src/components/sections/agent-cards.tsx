import { Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatTokens } from "@/lib/format";
import type { AgentRow } from "@/lib/types";

const AGENT_DESC: Record<string, string> = {
  build: "Primary coding agent - writes, edits, debugs",
  explore: "Fast codebase exploration and search",
  general: "General-purpose research and tasks",
  plan: "High-level planning and architecture",
};

const AGENT_COLOR: Record<string, string> = {
  build: "linear-gradient(90deg, #00abe0, #00deff)",
  explore: "linear-gradient(90deg, #dc751e, #f59e0b)",
  general: "linear-gradient(90deg, #22c55e, #4ade80)",
  plan: "linear-gradient(90deg, #94a3b8, #cbd5e1)",
};

export function AgentCards({ agents }: { agents: AgentRow[] }) {
  const maxSessions = Math.max(1, ...agents.map((a) => a.sessions));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {agents.map((a, i) => {
        const total =
          a.tokensInput + a.tokensOutput + a.tokensReasoning + a.tokensCacheRead;
        return (
          <Card
            key={a.agent}
            className="card-lift animate__animated animate__fadeInUp"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-accent shrink-0" />
                    <h3 className="text-base font-semibold capitalize">{a.agent}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {AGENT_DESC[a.agent] ?? "Works on sessions"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold font-mono leading-none">
                    {formatNumber(a.sessions)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">sessions</p>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full progress-glow transition-[width] duration-500 ease-out"
                  style={{
                    width: `${(a.sessions / maxSessions) * 100}%`,
                    background: AGENT_COLOR[a.agent] ?? AGENT_COLOR.build,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">msgs</span>
                  <span>{formatNumber(a.messages)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">tools</span>
                  <span>{formatNumber(a.toolCalls)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">tokens</span>
                  <span>{formatTokens(total)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">in/out</span>
                  <span>
                    {formatTokens(a.tokensInput)}/{formatTokens(a.tokensOutput)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
