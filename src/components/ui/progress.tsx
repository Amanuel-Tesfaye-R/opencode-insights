import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max,
  className,
  barClassName,
  gradient,
}: {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
  gradient?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-muted/60 overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full progress-glow transition-[width] duration-500 ease-out",
          barClassName
        )}
        style={{
          width: `${pct}%`,
          background: gradient ?? "linear-gradient(90deg, #00abe0, #00deff)",
        }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card flex flex-col items-center justify-center py-12 px-6">
      <div className="rounded-full bg-muted p-4 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
