import { ArrowUpRight, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { basename, formatNumber, formatTokens } from "@/lib/format";
import type { ProjectBreakdown } from "@/lib/types";

const TILE_ACCENTS = [
  { line: "from-[#00abe0] to-[#00deff]", glow: "rgba(0,222,255,0.35)" },
  { line: "from-[#dc751e] to-[#f59e0b]", glow: "rgba(245,158,11,0.3)" },
  { line: "from-[#22c55e] to-[#4ade80]", glow: "rgba(74,222,128,0.3)" },
  { line: "from-[#94a3b8] to-[#cbd5e1]", glow: "rgba(203,213,225,0.3)" },
  { line: "from-[#a855f7] to-[#d946ef]", glow: "rgba(217,70,239,0.3)" },
];

export function ProjectBreakdown({ projects }: { projects: ProjectBreakdown[] }) {
  const maxSessions = Math.max(1, ...projects.map((p) => p.sessions));
  return (
    <Card className="animate__animated animate__fadeInUp animate-delay-3">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-accent" />
              Projects
            </CardTitle>
            <CardDescription className="mt-1">Where the work happened</CardDescription>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((p, i) => {
            const worktree = p.worktree && p.worktree !== "/" ? p.worktree : "";
            const name =
              p.projectName ||
              (worktree ? basename(worktree) : p.directory ? basename(p.directory) : "Global");
            const path = worktree || p.directory || p.projectId;
            const accent = TILE_ACCENTS[i % TILE_ACCENTS.length];
            const share = (p.sessions / maxSessions) * 100;
            return (
              <Link
                key={p.projectId}
                href={`/sessions?project=${encodeURIComponent(p.projectId)}`}
                className="group relative overflow-hidden rounded-lg border bg-card/60 p-4 transition-all hover:border-border hover:shadow-md hover:-translate-y-0.5"
              >
                <span
                  className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.line} opacity-80`}
                  style={{ boxShadow: `0 0 12px ${accent.glow}` }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      {path}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-2xl font-bold font-mono leading-none">
                      {formatNumber(p.sessions)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      sessions
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${share}%`,
                      background: `linear-gradient(90deg, #00abe0, #00deff)`,
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-[11px] text-muted-foreground font-mono">
                  <span>{formatNumber(p.messages)} msgs</span>
                  <span>{formatTokens(p.tokensInput + p.tokensOutput)}</span>
                  <span className="text-ok">+{formatNumber(p.additions)}</span>
                  <span className="text-err">-{formatNumber(p.deletions)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
