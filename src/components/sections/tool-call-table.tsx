import Link from "next/link";
import { ChevronLeft, ChevronRight, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDateTime, shortPreview } from "@/lib/format";
import type { ToolCall } from "@/lib/types";

export function ToolCallTable({
  calls,
  total,
  page,
  pageSize,
  tools,
  currentTool,
  currentStatus,
}: {
  calls: ToolCall[];
  total: number;
  page: number;
  pageSize: number;
  tools: string[];
  currentTool: string;
  currentStatus: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const statuses = ["all", "completed", "error", "pending"];

  const buildHref = (tool: string, status: string, p: number) => {
    const params = new URLSearchParams();
    if (tool !== "all") params.set("tool", tool);
    if (status !== "all") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/tools?${qs}` : "/tools";
  };

  if (total === 0) {
    return (
      <EmptyState
        icon={<Wrench className="h-8 w-8 text-muted-foreground" />}
        title="No tool calls found"
        description="Adjust the filters or check back after your next session."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
          Tool
        </span>
        {["all", ...tools].map((tool) => (
          <Link
            key={tool}
            href={buildHref(tool, currentStatus, 1)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              currentTool === tool
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {tool}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
          Status
        </span>
        {statuses.map((status) => (
          <Link
            key={status}
            href={buildHref(currentTool, status, 1)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              currentStatus === status
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {status}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden animate__animated animate__fadeInUp">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tool
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Session
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Input
                </th>
                <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Output
                </th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr
                  key={call.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-2 md:px-4 py-2.5 md:py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {formatDateTime(call.timeCreated)}
                  </td>
                  <td className="px-2 md:px-4 py-2.5 md:py-3 text-sm font-mono font-medium">
                    {call.tool}
                  </td>
                  <td className="px-2 md:px-4 py-2.5 md:py-3 text-sm">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm max-w-[220px]">
                    <Link
                      href={`/sessions/${call.sessionId}`}
                      className="truncate block hover:text-accent transition-colors"
                    >
                      {call.sessionTitle}
                    </Link>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-xs font-mono text-muted-foreground max-w-[320px]">
                    <span className="block truncate" title={call.inputPreview}>
                      {call.inputPreview || "-"}
                    </span>
                  </td>
                  <td className="hidden xl:table-cell px-4 py-3 text-xs font-mono text-muted-foreground max-w-[320px]">
                    <span className="block truncate" title={call.outputPreview}>
                      {shortPreview(call.outputPreview, 120) || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Page {page} of {pages} | {total.toLocaleString()} calls
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildHref(currentTool, currentStatus, Math.max(1, page - 1))}
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              page <= 1 && "pointer-events-none opacity-50"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={buildHref(currentTool, currentStatus, Math.min(pages, page + 1))}
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              page >= pages && "pointer-events-none opacity-50"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
