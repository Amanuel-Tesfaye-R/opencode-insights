import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { ProjectCards } from "@/components/sections/project-cards";
import { getProjectBreakdown } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects — OpenCode Usage Tracking",
  description: "See which projects you work on most with AI. Track sessions, tokens, files changed, and cost per project across all your codebases.",
  keywords: ["opencode projects", "AI project analytics", "coding projects", "project tracking", "multi-project analytics"],
};

const RANGES = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "all", label: "All" },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.range === "string" ? params.range : "all";
  const range = ["7", "30", "90", "all"].includes(raw) ? raw : "all";
  const days = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;

  const projects = getProjectBreakdown(days);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description={`${formatNumber(projects.length)} projects in the selected range. Click a project to see its sessions.`}
        actions={
          <Segmented options={RANGES} value={range} basePath="/projects" />
        }
      />
      <ProjectCards projects={projects} />
    </div>
  );
}
