import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ToolCallTable } from "@/components/sections/tool-call-table";
import { getDistinctTools, getToolCalls } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tool calls",
};

const PAGE_SIZE = 50;

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tool = typeof params.tool === "string" ? params.tool : "all";
  const status = typeof params.status === "string" ? params.status : "all";
  const page = Math.max(1, Number(params.page) || 1);

  const [tools, { calls, total }] = await Promise.all([
    getDistinctTools(),
    getToolCalls({ tool, status, page, pageSize: PAGE_SIZE }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tool calls"
        description={`Every single tool call across all sessions: ${formatNumber(total)} recorded.`}
      />
      <ToolCallTable
        calls={calls}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        tools={tools}
        currentTool={tool}
        currentStatus={status}
      />
    </div>
  );
}
