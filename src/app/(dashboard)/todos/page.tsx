import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { TodosCard } from "@/components/sections/todos-card";
import { getTodos } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Todos — OpenCode Usage Tracking",
  description: "Track todos created and completed during your AI coding sessions. See task completion rates and priority breakdowns.",
  keywords: ["opencode todos", "AI task tracking", "coding todos", "task management", "session tasks", "productivity tracking"],
};

export default async function TodosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "all";
  const todos = getTodos();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Todos"
        description={`${formatNumber(todos.length)} tracked tasks across all sessions, filterable by status and priority.`}
      />
      <TodosCard todos={todos} filter={status} />
    </div>
  );
}
