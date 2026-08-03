import type { CustomerStatus } from "@/lib/customers.types";
import { CUSTOMER_STATUS_OPTIONS } from "@/lib/customers.types";

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
  qualified: {
    label: "Qualifiziert",
    className: "bg-[#1E3A5F] text-blue-300",
  },
  proposal: {
    label: "Angebot",
    className: "bg-[#78350F] text-amber-400",
  },
  won: {
    label: "Gewonnen",
    className: "bg-[#14532D] text-green-400",
  },
  lost: {
    label: "Verloren",
    className: "bg-zinc-800/80 text-zinc-500",
  },
};

type CustomerStatusBadgeProps = {
  status: CustomerStatus | string;
};

export default function CustomerStatusBadge({
  status,
}: CustomerStatusBadgeProps) {
  const option = CUSTOMER_STATUS_OPTIONS.find((entry) => entry.value === status);
  const config =
    statusConfig[status as CustomerStatus] ??
    ({
      label: option?.label ?? String(status),
      className: "bg-zinc-800 text-zinc-300",
    } as const);

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
