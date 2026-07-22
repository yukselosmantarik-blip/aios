import type { CustomerStatus } from "@/lib/customers.types";

const statusConfig: Record<
  CustomerStatus,
  { label: string; className: string }
> = {
  lead: {
    label: "Lead",
    className: "bg-zinc-800 text-zinc-300",
  },
  contacted: {
    label: "Kontaktiert",
    className: "bg-[#1E3A5F] text-blue-400",
  },
  meeting: {
    label: "Meeting",
    className: "bg-[#1E3A5F] text-blue-300",
  },
  proposal: {
    label: "Angebot",
    className: "bg-[#78350F] text-amber-400",
  },
  customer: {
    label: "Kunde",
    className: "bg-[#14532D] text-green-400",
  },
  inactive: {
    label: "Inaktiv",
    className: "bg-zinc-800/80 text-zinc-500",
  },
};

type CustomerStatusBadgeProps = {
  status: CustomerStatus;
};

export default function CustomerStatusBadge({
  status,
}: CustomerStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
