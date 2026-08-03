"use client";

import { useState } from "react";
import CreateCustomerDialog from "@/components/customers/CreateCustomerDialog";
import CustomersEmptyState from "@/components/customers/CustomersEmptyState";
import CustomersList from "@/components/customers/CustomersList";
import LogoutButton from "@/components/LogoutButton";
import type { Customer } from "@/lib/customers.types";

type CustomersPageContentProps = {
  customers: Customer[];
};

export default function CustomersPageContent({
  customers,
}: CustomersPageContentProps) {
  const [customerCount, setCustomerCount] = useState(customers.length);

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Kunden
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Verwalte Leads und Kundenbeziehungen an einem Ort.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <CreateCustomerDialog />
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm tabular-nums text-zinc-400">
            {customerCount} {customerCount === 1 ? "Eintrag" : "Einträge"}
          </span>
          <div className="[&_button]:text-zinc-400 [&_button]:hover:text-zinc-200">
            <LogoutButton />
          </div>
        </div>
      </header>

      {customers.length === 0 ? (
        <CustomersEmptyState />
      ) : (
        <CustomersList
          customers={customers}
          onCustomerDeleted={() =>
            setCustomerCount((count) => Math.max(0, count - 1))
          }
        />
      )}
    </>
  );
}
