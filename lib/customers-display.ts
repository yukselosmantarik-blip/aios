import {
  CUSTOMER_SOURCE_OPTIONS,
  type Customer,
  type CustomerCrmStats,
  type CustomerStatus,
  normalizeCustomerStatus,
} from "@/lib/customers.types";

export function formatCustomerContactName(customer: Customer): string {
  const name = `${customer.contact_first_name ?? ""} ${customer.contact_last_name ?? ""}`.trim();
  return name || "—";
}

export function formatCustomerSource(source: string | null): string {
  if (!source?.trim()) {
    return "—";
  }
  const match = CUSTOMER_SOURCE_OPTIONS.find((option) => option.value === source);
  return match?.label ?? source;
}

export function formatCustomerWebsiteHref(website: string | null): string | null {
  if (!website?.trim()) {
    return null;
  }
  const trimmed = website.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function formatPhoneTelHref(phone: string | null): string | null {
  if (!phone?.trim()) {
    return null;
  }
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export function computeCustomerCrmStats(customers: Customer[]): CustomerCrmStats {
  let openLeads = 0;
  let proposals = 0;
  let won = 0;

  for (const customer of customers) {
    const status = normalizeCustomerStatus(customer.status);
    if (status === "lead" || status === "contacted" || status === "qualified") {
      openLeads += 1;
    } else if (status === "proposal") {
      proposals += 1;
    } else if (status === "won") {
      won += 1;
    }
  }

  return {
    total: customers.length,
    openLeads,
    proposals,
    won,
  };
}

export const OPEN_LEAD_STATUSES: CustomerStatus[] = [
  "lead",
  "contacted",
  "qualified",
];

export function customerMatchesSearch(customer: Customer, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    customer.company_name,
    customer.contact_first_name,
    customer.contact_last_name,
    customer.email,
    customer.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}
