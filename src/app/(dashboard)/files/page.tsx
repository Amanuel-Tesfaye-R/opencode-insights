import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { FilesCard } from "@/components/sections/files-card";
import { getFileBreakdown } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Files — OpenCode Usage Tracking",
  description: "See which files you edit most with AI. Track file changes, patch counts, and edit frequency across all your OpenCode sessions.",
  keywords: ["opencode files", "AI file edits", "most edited files", "coding activity", "file tracking", "patch tracking"],
};

export default async function FilesPage() {
  const files = getFileBreakdown(30);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Files"
        description={`The ${formatNumber(files.length)} most-edited files across all sessions, ranked by patch count.`}
      />
      <FilesCard files={files} />
    </div>
  );
}
