import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { AgentCards } from "@/components/sections/agent-cards";
import { getAgentBreakdown } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agents",
};

const RANGES = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "all", label: "All" },
];

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.range === "string" ? params.range : "all";
  const range = ["7", "30", "90", "all"].includes(raw) ? raw : "all";
  const days = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;

  const agents = getAgentBreakdown(days);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description={`${formatNumber(agents.length)} agents in the selected range, with sessions, tokens and tool usage per agent.`}
        actions={
          <Segmented options={RANGES} value={range} basePath="/agents" />
        }
      />
      <AgentCards agents={agents} />
    </div>
  );
}
