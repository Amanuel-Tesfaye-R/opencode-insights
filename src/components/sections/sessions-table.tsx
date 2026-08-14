"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Search, MessagesSquare } from "lucide-react";
import { ModelBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  formatCost,
  formatDate,
  formatDuration,
  formatNumber,
  formatTokens,
} from "@/lib/format";
import type { SessionSummary } from "@/lib/types";

export function SessionsTable({
  sessions,
  initialProject,
}: {
  sessions: SessionSummary[];
  initialProject?: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [project, setProject] = useState(initialProject ?? "all");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) {
      if (!map.has(s.projectId)) {
        map.set(
          s.projectId,
          s.projectName || s.directoryName || s.projectId
        );
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [sessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (project !== "all" && s.projectId !== project) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.directory.toLowerCase().includes(q) ||
        s.modelId.toLowerCase().includes(q) ||
        s.directoryName.toLowerCase().includes(q)
      );
    });
  }, [sessions, query, project]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions, directories, models..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setProject("all")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              project === "all"
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {projects.map(([id, name]) => (
            <button
              key={id}
              onClick={() => setProject(id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                project === id
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="h-8 w-8 text-muted-foreground" />}
          title="No sessions found"
          description="Try a different search or clear the project filter."
        />
      ) : (
        <div className="rounded-lg border overflow-hidden animate__animated animate__fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Session
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Msg
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tools
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="hidden xl:table-cell px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Diffs
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-2 md:px-4 py-2.5 md:py-3 text-sm max-w-[280px]">
                      <p className="font-medium truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground truncate md:hidden">
                        {s.directoryName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate hidden md:block">
                        {s.directoryName}
                      </p>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm">
                      <ModelBadge model={s.modelId} />
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground font-mono whitespace-nowrap">
                      {formatDuration(s.durationMs)}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm font-mono text-right">
                      {formatNumber(s.messageCount)}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm font-mono text-right">
                      {formatNumber(s.toolCount)}
                    </td>
                    <td className="px-2 md:px-4 py-2.5 md:py-3 text-sm font-mono text-right whitespace-nowrap">
                      {formatTokens(s.tokensInput + s.tokensOutput)}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        c:{formatTokens(s.tokensCacheRead)}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell px-4 py-3 text-sm font-mono text-right whitespace-nowrap">
                      <span className="text-ok">+{formatNumber(s.additions)}</span>{" "}
                      <span className="text-err">-{formatNumber(s.deletions)}</span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm font-mono text-right">
                      {formatCost(s.cost)}
                    </td>
                    <td className="px-2 md:px-4 py-2.5 md:py-3 text-right">
                      <button
                        onClick={() => router.push(`/sessions/${s.id}`)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        aria-label={`View session ${s.title}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {formatNumber(filtered.length)} of {formatNumber(sessions.length)} sessions
      </p>
    </div>
  );
}
