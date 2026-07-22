"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CustomerStatusBadge from "@/components/customers/CustomerStatusBadge";
import DeleteCustomerDialog from "@/components/customers/DeleteCustomerDialog";
import EditCustomerDialog from "@/components/customers/EditCustomerDialog";
import type { Customer } from "@/lib/customers.types";

type CustomersTableProps = {
  customers: Customer[];
  onCustomerDeleted?: () => void;
};

function formatContactName(customer: Customer): string {
  return `${customer.contact_first_name} ${customer.contact_last_name}`.trim();
}

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function formatOptional(value: string | null): string {
  return value?.trim() || "—";
}

export default function CustomersTable({
  customers,
  onCustomerDeleted,
}: CustomersTableProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const visibleCustomers = useMemo(
    () => customers.filter((customer) => !removedIds.includes(customer.id)),
    [customers, removedIds],
  );

  function handleEdit(customer: Customer) {
    setSuccessMessage(undefined);
    setEditingCustomer(customer);
  }

  function handleCloseEdit() {
    setEditingCustomer(null);
  }

  function handleDelete(customer: Customer) {
    setSuccessMessage(undefined);
    setDeletingCustomer(customer);
  }

  function handleCloseDelete() {
    setDeletingCustomer(null);
  }

  function handleMutationSuccess(message: string) {
    setSuccessMessage(message);
    setEditingCustomer(null);
    router.refresh();
  }

  function handleDeleteSuccess(message: string, customerId: string) {
    setSuccessMessage(message);
    setDeletingCustomer(null);
    setRemovedIds((current) =>
      current.includes(customerId) ? current : [...current, customerId],
    );
    onCustomerDeleted?.();
    router.refresh();
  }

  return (
    <>
      {successMessage ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-green-900/50 bg-green-950/20 px-4 py-3 text-sm text-green-400"
        >
          {successMessage}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Unternehmen
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Ansprechpartner
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  E-Mail
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Telefon
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Erstellt
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-zinc-800/80 transition-colors last:border-b-0 hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-zinc-50">
                    {customer.company_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {formatContactName(customer)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 tabular-nums">
                    {formatOptional(customer.phone)}
                  </td>
                  <td className="px-4 py-3">
                    <CustomerStatusBadge status={customer.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 tabular-nums">
                    {formatCreatedAt(customer.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(customer)}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(customer)}
                        className="rounded-md border border-red-900/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:border-red-900/60 hover:bg-red-950/20"
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

      <EditCustomerDialog
        customer={editingCustomer}
        open={editingCustomer !== null}
        onClose={handleCloseEdit}
        onSuccess={handleMutationSuccess}
      />

      <DeleteCustomerDialog
        customer={deletingCustomer}
        open={deletingCustomer !== null}
        onClose={handleCloseDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
