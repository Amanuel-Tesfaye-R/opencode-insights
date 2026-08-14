import { FileCode2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { basename, formatNumber } from "@/lib/format";
import type { FileRow } from "@/lib/types";

const FILE_COLORS = [
  "bg-primary/15 text-primary border-primary/30",
  "bg-accent/15 text-accent border-accent/30",
  "bg-secondary/15 text-secondary border-secondary/30",
  "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30",
];

export function FilesCard({ files }: { files: FileRow[] }) {
  const maxEdits = Math.max(1, ...files.map((f) => f.edits));
  return (
    <Card className="animate__animated animate__fadeInUp">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-accent" />
          Most edited files
        </CardTitle>
        <CardDescription className="mt-1">
          Files touched most often by patches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.map((f, i) => (
          <div key={f.path}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <p className="text-sm font-medium font-mono truncate">
                  <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                  {basename(f.path)}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  {f.path}
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono shrink-0 ml-3">
                {formatNumber(f.edits)} edits
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full progress-glow transition-[width] duration-500 ease-out"
                style={{
                  width: `${(f.edits / maxEdits) * 100}%`,
                  background: "linear-gradient(90deg, #00abe0, #00deff)",
                }}
              />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${FILE_COLORS[i % FILE_COLORS.length]}`}
              >
                {f.projectName || "Global"}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
