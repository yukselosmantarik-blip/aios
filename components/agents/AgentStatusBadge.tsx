import type { AgentStatus } from "@/lib/agents.types";

const statusConfig: Record<
  AgentStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Entwurf",
    className: "bg-[#78350F] text-amber-400",
  },
  active: {
    label: "Aktiv",
    className: "bg-[#14532D] text-green-400",
  },
  inactive: {
    label: "Inaktiv",
    className: "bg-red-950/40 text-red-400",
  },
};

type AgentStatusBadgeProps = {
  status: AgentStatus;
};

export default function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
