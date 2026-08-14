import type { Metadata } from "next";
import {
  FileCode2,
  Gauge,
  ListChecks,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Segmented } from "@/components/ui/segmented";
import { HeroTotals } from "@/components/sections/hero-totals";
import { HourlyHeatmap } from "@/components/sections/hourly-heatmap";
import { ModelBreakdown } from "@/components/sections/model-breakdown";
import { ToolUsage } from "@/components/sections/tool-usage";
import { ProjectBreakdown } from "@/components/sections/project-breakdown";
import { HeaviestSessions } from "@/components/sections/heaviest-sessions";
import { ChartTokenFlow } from "@/components/sections/chart-token-flow";
import { ChartActivityInteractive } from "@/components/sections/chart-activity-interactive";
import { ChartWeekdayRadar } from "@/components/sections/chart-weekday-radar";
import { ChartCacheRadial } from "@/components/sections/chart-cache-radial";
import {
  getDailyActivity,
  getHourlyActivity,
  getModelBreakdown,
  getOverviewStats,
  getProjectBreakdown,
  getToolBreakdown,
  getTopSessions,
} from "@/lib/queries";
import { formatNumber, formatTokens } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview — OpenCode Usage Tracking",
  description: "Your complete AI coding analytics dashboard. Track token usage, model breakdowns, tool calls, projects, files edited, cost, and productivity — all from your local OpenCode database.",
  keywords: ["opencode dashboard", "AI coding analytics", "token tracking", "usage tracking", "AI productivity", "developer analytics", "coding metrics"],
};

const RANGES = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "all", label: "All" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function weekdayRhythm(daily: ReturnType<typeof getDailyActivity>) {
  const counts = new Array(7).fill(0);
  for (const d of daily) {
    const wd = new Date(`${d.date}T00:00:00`).getDay();
    counts[wd] += d.messages;
  }
  return WEEKDAYS.map((day, i) => ({ day, value: counts[i] }));
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.range === "string" ? params.range : "all";
  const range = ["7", "30", "90", "all"].includes(raw) ? raw : "all";
  const days = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;
  const rangeLabel = days ? `last ${days} days` : "all time";

  const [stats, daily, hourly, models, projects, tools, top] = await Promise.all([
    getOverviewStats(days),
    getDailyActivity(days),
    getHourlyActivity(days),
    getModelBreakdown(days),
    getProjectBreakdown(days),
    getToolBreakdown(days),
    getTopSessions(8, days),
  ]);

  const total =
    stats.tokensInput +
    stats.tokensOutput +
    stats.tokensReasoning +
    stats.tokensCacheRead;
  const cachePct = total > 0 ? (stats.tokensCacheRead / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="OpenCode Insights logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-contain shadow-[0_0_16px_rgba(0,222,255,0.25)]"
            />
            OpenCode Insights
          </span>
        }
        description="Every detail of OpenCode's work, filtered by the timeline."
        actions={
          <Segmented options={RANGES} value={range} basePath="/" />
        }
      />

      <HeroTotals stats={stats} rangeLabel={rangeLabel} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Avg tokens / session"
          value={formatTokens(Math.round(stats.avgTokensPerSession))}
          icon={<Gauge className="h-5 w-5 text-primary" />}
          sub={`median ${formatTokens(Math.round(stats.medianTokensPerSession))}`}
          delay={0}
          accent
        />
        <KpiCard
          label="Files touched"
          value={formatNumber(stats.filesTouched)}
          icon={<FileCode2 className="h-5 w-5 text-primary" />}
          sub={`${formatNumber(stats.patches)} patches applied`}
          delay={40}
        />
        <KpiCard
          label="Tool calls"
          value={formatNumber(stats.toolCalls)}
          icon={<Wrench className="h-5 w-5 text-primary" />}
          sub={`${formatNumber(stats.toolErrors)} errors`}
          delay={80}
        />
        <KpiCard
          label="Todos"
          value={formatNumber(stats.todosTotal)}
          icon={<ListChecks className="h-5 w-5 text-primary" />}
          sub={`${formatNumber(stats.todosCompleted)} completed`}
          delay={120}
        />
      </div>

      <ChartActivityInteractive daily={daily} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartTokenFlow daily={daily} />
        </div>
        <div>
          <ChartCacheRadial
            pct={cachePct}
            totalFormatted={formatTokens(stats.tokensCacheRead)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <ChartWeekdayRadar data={weekdayRhythm(daily)} />
        </div>
        <div className="lg:col-span-2">
          <HourlyHeatmap hours={hourly} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ModelBreakdown models={models} />
        </div>
        <div>
          <ToolUsage tools={tools} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProjectBreakdown projects={projects} />
        </div>
        <div>
          <HeaviestSessions sessions={top} />
        </div>
      </div>
    </div>
  );
}
