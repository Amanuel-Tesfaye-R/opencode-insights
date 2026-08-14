import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon,
  sub,
  accent = false,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "card-lift relative overflow-hidden rounded-xl border bg-card p-5 animate__animated animate__fadeInUp",
        accent && "border-accent/30"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {accent && (
        <>
          <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-gold/70 via-gold/30 to-transparent" />
          <div className="pointer-events-none absolute -top-10 right-0 h-28 w-28 rounded-full bg-accent/10 blur-[50px]" />
        </>
      )}
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 p-2.5 ring-1 ring-accent/20 shadow-[0_0_18px_rgba(0,222,255,0.12)]">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight mt-2 font-mono">
        {value}
      </div>
      {sub && <div className="text-xs mt-1 text-muted-foreground">{sub}</div>}
    </div>
  );
}
