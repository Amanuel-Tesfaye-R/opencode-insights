import { FolderGit2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { basename, formatCost, formatNumber, formatTokens, timeAgo } from "@/lib/format";
import type { ProjectBreakdown } from "@/lib/types";

function projectName(p: ProjectBreakdown): string {
  const worktree = p.worktree && p.worktree !== "/" ? p.worktree : "";
  return (
    p.projectName ||
    (worktree ? basename(worktree) : p.directory ? basename(p.directory) : "Global")
  );
}

function projectPath(p: ProjectBreakdown): string {
  return p.worktree && p.worktree !== "/" ? p.worktree : p.directory || p.projectId;
}

export function ProjectCards({ projects }: { projects: ProjectBreakdown[] }) {
  const maxSessions = Math.max(1, ...projects.map((p) => p.sessions));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((p, i) => (
        <Link
          key={p.projectId}
          href={`/sessions?project=${encodeURIComponent(p.projectId)}`}
          className="animate__animated animate__fadeInUp"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Card className="card-lift h-full">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-accent shrink-0" />
                    <h3 className="text-base font-semibold truncate">{projectName(p)}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono truncate mt-1">
                    {projectPath(p)}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatNumber(p.sessions)} sessions
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {formatNumber(p.messages)} msgs
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full progress-glow transition-[width] duration-500 ease-out"
                    style={{
                      width: `${(p.sessions / maxSessions) * 100}%`,
                      background: "linear-gradient(90deg, #00abe0, #00deff)",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-mono">
                <span>{formatTokens(p.tokensInput + p.tokensOutput)} tokens</span>
                <span className="text-ok">+{formatNumber(p.additions)}</span>
                <span className="text-err">-{formatNumber(p.deletions)}</span>
                <span>{formatCost(p.cost)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <span className="text-[11px] text-muted-foreground">Last active</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {p.lastActive ? timeAgo(p.lastActive) : "never"}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
