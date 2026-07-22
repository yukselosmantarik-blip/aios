import type { TaskStatus } from "@/lib/tasks.types";

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  todo: {
    label: "Offen",
    className: "bg-zinc-800 text-zinc-300",
  },
  in_progress: {
    label: "In Bearbeitung",
    className: "bg-[#1E3A5F] text-blue-400",
  },
  done: {
    label: "Erledigt",
    className: "bg-[#14532D] text-green-400",
  },
};

type TaskStatusBadgeProps = {
  status: TaskStatus;
};

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
