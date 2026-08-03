"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CustomerStatusBadge from "@/components/customers/CustomerStatusBadge";
import DeleteCustomerDialog from "@/components/customers/DeleteCustomerDialog";
import {
  CUSTOMER_SOURCE_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  type Customer,
  type CustomerSortOption,
  type CustomerStatus,
} from "@/lib/customers.types";
import {
  customerMatchesSearch,
  formatCustomerContactName,
  formatCustomerSource,
} from "@/lib/customers-display";

type CustomersListProps = {
  customers: Customer[];
  onCustomerDeleted?: () => void;
};

const sortLabels: Record<CustomerSortOption, string> = {
  newest: "Neueste zuerst",
  oldest: "Älteste zuerst",
  company_name: "Unternehmen A–Z",
  updated_desc: "Zuletzt aktualisiert",
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function compareCustomers(
  left: Customer,
  right: Customer,
  sort: CustomerSortOption,
): number {
  switch (sort) {
    case "oldest":
      return left.created_at.localeCompare(right.created_at);
    case "company_name":
      return left.company_name.localeCompare(right.company_name, "de");
    case "updated_desc":
      return right.updated_at.localeCompare(left.updated_at);
    case "newest":
    default:
      return right.created_at.localeCompare(left.created_at);
  }
}

export default function CustomersList({
  customers,
  onCustomerDeleted,
}: CustomersListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "">("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sort, setSort] = useState<CustomerSortOption>("newest");
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const industryOptions = useMemo(() => {
    const values = new Set<string>();
    for (const customer of customers) {
      if (customer.industry?.trim()) {
        values.add(customer.industry.trim());
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b, "de"));
  }, [customers]);

  const visibleCustomers = useMemo(() => {
    return customers
      .filter((customer) => !removedIds.includes(customer.id))
      .filter((customer) => customerMatchesSearch(customer, search))
      .filter((customer) =>
        statusFilter ? customer.status === statusFilter : true,
      )
      .filter((customer) =>
        industryFilter
          ? (customer.industry ?? "").trim() === industryFilter
          : true,
      )
      .filter((customer) =>
        sourceFilter ? (customer.source ?? "") === sourceFilter : true,
      )
      .sort((left, right) => compareCustomers(left, right, sort));
  }, [
    customers,
    industryFilter,
    removedIds,
    search,
    sort,
    sourceFilter,
    statusFilter,
  ]);

  return (
    <>
      <div className="mb-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div>
            <label htmlFor="customer-search" className="sr-only">
              Suche
            </label>
            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Suche nach Unternehmen, Kontakt, E-Mail oder Telefon"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            aria-label="Status filtern"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CustomerStatus | "")
            }
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">Alle Status</option>
            {CUSTOMER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Branche filtern"
            value={industryFilter}
            onChange={(event) => setIndustryFilter(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">Alle Branchen</option>
            {industryOptions.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          <select
            aria-label="Quelle filtern"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">Alle Quellen</option>
            {CUSTOMER_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sortierung"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as CustomerSortOption)
            }
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            {(Object.keys(sortLabels) as CustomerSortOption[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-zinc-500">
          {visibleCustomers.length}{" "}
          {visibleCustomers.length === 1 ? "Treffer" : "Treffer"}
        </p>
      </div>

      {visibleCustomers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center text-sm text-zinc-500">
          Keine Kunden für die aktuelle Filterung gefunden.
        </p>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900">
                    {[
                      "Unternehmen",
                      "Ansprechpartner",
                      "E-Mail",
                      "Telefon",
                      "Branche",
                      "Quelle",
                      "Status",
                      "Erstellt",
                      "Aktualisiert",
                      "",
                    ].map((label) => (
                      <th
                        key={label || "actions"}
                        className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-zinc-800/80 last:border-b-0 hover:bg-zinc-800/40"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-zinc-50 hover:text-blue-400"
                        >
                          {customer.company_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        {formatCustomerContactName(customer)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {customer.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 tabular-nums">
                        {customer.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {customer.industry ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {formatCustomerSource(customer.source)}
                      </td>
                      <td className="px-4 py-3">
                        <CustomerStatusBadge status={customer.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500 tabular-nums">
                        {formatDateTime(customer.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500 tabular-nums">
                        {formatDateTime(customer.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                          >
                            Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingCustomer(customer)}
                            className="rounded-md border border-red-900/40 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-950/20"
                          >
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-3 md:hidden">
            {visibleCustomers.map((customer) => (
              <li
                key={customer.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-base font-semibold text-zinc-50"
                    >
                      {customer.company_name}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatCustomerContactName(customer)}
                    </p>
                  </div>
                  <CustomerStatusBadge status={customer.status} />
                </div>
                <dl className="mt-3 grid gap-2 text-sm text-zinc-400">
                  <div className="flex justify-between gap-3">
                    <dt>E-Mail</dt>
                    <dd className="truncate text-zinc-200">{customer.email ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Telefon</dt>
                    <dd>{customer.phone ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Branche</dt>
                    <dd>{customer.industry ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Quelle</dt>
                    <dd>{formatCustomerSource(customer.source)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm font-medium text-zinc-200"
                  >
                    Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeletingCustomer(customer)}
                    className="rounded-lg border border-red-900/40 px-3 py-2 text-sm text-red-400"
                  >
                    Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <DeleteCustomerDialog
        customer={deletingCustomer}
        open={deletingCustomer !== null}
        onClose={() => setDeletingCustomer(null)}
        onSuccess={(_message, customerId) => {
          setDeletingCustomer(null);
          setRemovedIds((current) =>
            current.includes(customerId) ? current : [...current, customerId],
          );
          onCustomerDeleted?.();
          router.refresh();
        }}
      />
    </>
  );
}
