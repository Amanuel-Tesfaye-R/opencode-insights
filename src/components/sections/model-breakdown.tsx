import { Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { formatCost, formatNumber, formatTokens } from "@/lib/format";
import type { ModelBreakdown } from "@/lib/types";

export function ModelBreakdown({ models }: { models: ModelBreakdown[] }) {
  const maxTokens = Math.max(1, ...models.map((m) => m.tokensInput + m.tokensOutput));
  return (
    <Card className="animate__animated animate__fadeInUp animate-delay-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              Models
            </CardTitle>
            <CardDescription className="mt-1">Sessions and tokens per model</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {models.map((m) => {
          const total = m.tokensInput + m.tokensOutput;
          return (
            <div key={`${m.providerId}-${m.modelId}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium font-mono">{m.modelId}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatNumber(m.sessions)} sessions
                </span>
              </div>
              <ProgressBar
                value={total}
                max={maxTokens}
                gradient="linear-gradient(90deg, #00abe0, #00deff)"
              />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-muted-foreground font-mono">
                <span>{formatTokens(total)} total</span>
                <span>in {formatTokens(m.tokensInput)}</span>
                <span>out {formatTokens(m.tokensOutput)}</span>
                <span>cache {formatTokens(m.tokensCacheRead)}</span>
                <span>{formatCost(m.cost)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
