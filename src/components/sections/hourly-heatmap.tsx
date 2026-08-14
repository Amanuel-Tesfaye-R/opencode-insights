import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import type { HourPoint } from "@/lib/types";

export function HourlyHeatmap({ hours }: { hours: HourPoint[] }) {
  const max = Math.max(1, ...hours.map((h) => h.count));
  const total = hours.reduce((a, h) => a + h.count, 0);
  return (
    <Card className="animate__animated animate__fadeInUp animate-delay-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          Hourly activity
        </CardTitle>
        <CardDescription className="mt-1">
          {formatNumber(total)} messages, by hour of day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {hours.map((h) => (
            <div
              key={h.hour}
              className="flex-1 flex flex-col justify-end items-center h-full group"
              title={`${h.hour}:00: ${formatNumber(h.count)} messages`}
            >
              <div
                className="w-full rounded-t-[3px] transition-opacity group-hover:opacity-70"
                style={{
                  height: `${Math.max(h.count > 0 ? 4 : 1, (h.count / max) * 100)}%`,
                  background:
                    h.count === 0
                      ? "rgba(148,163,184,0.12)"
                      : "linear-gradient(180deg, #00deff, #00abe0)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-2">
          {hours.map((h) => (
            <div key={h.hour} className="flex-1 text-center text-[9px] text-muted-foreground font-mono">
              {h.hour % 3 === 0 ? h.label : ""}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
