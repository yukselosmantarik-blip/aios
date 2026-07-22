import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
};

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zinc-50">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
