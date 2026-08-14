import Link from "next/link";
import { cn } from "@/lib/utils";

export function Segmented({
  options,
  value,
  basePath,
  param = "range",
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  basePath: string;
  param?: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        const href = opt.value === "all" ? basePath : `${basePath}?${param}=${opt.value}`;
        return (
          <Link
            key={opt.value}
            href={href}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              active
                ? "bg-gradient-to-b from-accent/25 to-primary/15 text-foreground shadow-sm ring-1 ring-accent/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
