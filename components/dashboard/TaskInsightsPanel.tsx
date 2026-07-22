import type { TaskInsights } from "@/lib/dashboard";

type TaskInsightsPanelProps = {
  insights: TaskInsights;
};

export default function TaskInsightsPanel({ insights }: TaskInsightsPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Aufgaben-Insights</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Offene Aufgaben nach Fälligkeit.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-medium text-zinc-400">Überfällig</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-red-400">
            {insights.overdue}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-medium text-zinc-400">Heute fällig</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-amber-400">
            {insights.dueToday}
          </p>
        </div>
      </div>
    </section>
  );
}
