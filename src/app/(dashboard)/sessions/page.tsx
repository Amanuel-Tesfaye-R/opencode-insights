import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { SessionsTable } from "@/components/sections/sessions-table";
import { getAllSessions } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sessions",
};

const RANGES = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "all", label: "All" },
];

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const project = typeof params.project === "string" ? params.project : null;
  const raw = typeof params.range === "string" ? params.range : "all";
  const range = ["7", "30", "90", "all"].includes(raw) ? raw : "all";
  const days = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;

  const sessions = getAllSessions(days);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions"
        description={`${formatNumber(sessions.length)} sessions in the selected range, searchable and filterable by project.`}
        actions={
          <Segmented options={RANGES} value={range} basePath="/sessions" />
        }
      />
      <SessionsTable sessions={sessions} initialProject={project} />
    </div>
  );
}
