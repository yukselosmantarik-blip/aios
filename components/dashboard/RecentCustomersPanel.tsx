import Link from "next/link";
import CustomerStatusBadge from "@/components/customers/CustomerStatusBadge";
import type { Customer } from "@/lib/customers.types";
import { formatCustomerContactName } from "@/lib/customers-display";

type RecentCustomersPanelProps = {
  customers: Customer[];
};

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default function RecentCustomersPanel({
  customers,
}: RecentCustomersPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">
            Neueste Kunden
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Die zuletzt angelegten Kunden.
          </p>
        </div>
        <Link
          href="/customers"
          className="shrink-0 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Alle anzeigen
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Noch keine Kunden vorhanden.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-zinc-800">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/customers/${customer.id}`}
                  className="truncate text-sm font-medium text-zinc-50 hover:text-blue-400"
                >
                  {customer.company_name}
                </Link>
                <p className="mt-0.5 truncate text-sm text-zinc-400">
                  {formatCustomerContactName(customer)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <CustomerStatusBadge status={customer.status} />
                <span className="text-xs tabular-nums text-zinc-500">
                  {formatCreatedAt(customer.created_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
