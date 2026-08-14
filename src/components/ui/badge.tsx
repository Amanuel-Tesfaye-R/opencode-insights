import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

const MODEL_COLORS = [
  "bg-primary/15 text-primary border-primary/30",
  "bg-accent/15 text-accent border-accent/30",
  "bg-secondary/15 text-secondary border-secondary/30",
  "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30",
];

function ModelBadge({
  model,
  index = 0,
}: {
  model: string;
  index?: number;
}) {
  const short =
    model.length > 24 ? `${model.slice(0, 22)}...` : model;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${MODEL_COLORS[index % MODEL_COLORS.length]}`}
    >
      {short}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  pending: "bg-warn/15 text-warn border-warn/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
}

const DOT_COLORS: Record<string, string> = {
  completed: "bg-[#22c55e]",
  error: "bg-destructive",
  pending: "bg-warn",
};

function StatusDot({ status }: { status: string }) {
  const color = DOT_COLORS[status] ?? "bg-muted-foreground/50";
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${color}`}
      title={status}
    />
  );
}

export { Badge, badgeVariants, ModelBadge, StatusBadge, StatusDot }
