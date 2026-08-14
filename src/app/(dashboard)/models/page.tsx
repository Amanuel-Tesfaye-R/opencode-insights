import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { ModelCards } from "@/components/sections/model-cards";
import { getModelBreakdown } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Models — OpenCode Usage Tracking",
  description: "See which AI models you use most. Compare Claude, GPT, Gemini, and others by session count, token usage, and cost.",
  keywords: ["opencode models", "AI model tracking", "Claude usage", "GPT usage", "model comparison", "LLM analytics", "AI cost per model"],
};

const RANGES = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "all", label: "All" },
];

export default async function ModelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.range === "string" ? params.range : "all";
  const range = ["7", "30", "90", "all"].includes(raw) ? raw : "all";
  const days = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;

  const models = getModelBreakdown(days);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Models"
        description={`${formatNumber(models.length)} models in the selected range, with token mix and cost per model.`}
        actions={
          <Segmented options={RANGES} value={range} basePath="/models" />
        }
      />
      <ModelCards models={models} />
    </div>
  );
}
