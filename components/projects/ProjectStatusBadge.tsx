import type { ProjectStatus } from "@/lib/projects.types";

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  planned: {
    label: "Geplant",
    className: "bg-zinc-800 text-zinc-300",
  },
  active: {
    label: "Aktiv",
    className: "bg-[#1E3A5F] text-blue-400",
  },
  paused: {
    label: "Pausiert",
    className: "bg-[#78350F] text-amber-400",
  },
  completed: {
    label: "Abgeschlossen",
    className: "bg-[#14532D] text-green-400",
  },
};

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
