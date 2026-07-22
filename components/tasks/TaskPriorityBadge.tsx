import type { TaskPriority } from "@/lib/tasks.types";

const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  low: {
    label: "Niedrig",
    className: "bg-zinc-800 text-zinc-400",
  },
  medium: {
    label: "Mittel",
    className: "bg-[#78350F] text-amber-400",
  },
  high: {
    label: "Hoch",
    className: "bg-red-950/40 text-red-400",
  },
};

type TaskPriorityBadgeProps = {
  priority: TaskPriority;
};

export default function TaskPriorityBadge({
  priority,
}: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
