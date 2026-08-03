export type CustomerStatus =
  | "lead"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export const CUSTOMER_STATUSES: CustomerStatus[] = [
  "lead",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
];

export const CUSTOMER_STATUS_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "qualified", label: "Qualifiziert" },
  { value: "proposal", label: "Angebot" },
  { value: "won", label: "Gewonnen" },
  { value: "lost", label: "Verloren" },
] as const;

const LEGACY_STATUS_MAP: Record<string, CustomerStatus> = {
  meeting: "qualified",
  customer: "won",
  inactive: "lost",
};

export function normalizeCustomerStatus(value: string): CustomerStatus {
  if (LEGACY_STATUS_MAP[value]) {
    return LEGACY_STATUS_MAP[value];
  }
  if (CUSTOMER_STATUSES.includes(value as CustomerStatus)) {
    return value as CustomerStatus;
  }
  return "lead";
}

export const CUSTOMER_SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Empfehlung" },
  { value: "cold_call", label: "Kaltakquise" },
  { value: "other", label: "Sonstiges" },
] as const;

export type Customer = {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type CreateCustomerInput = {
  company_name: string;
  contact_first_name: string | null;
  contact_last_name: string | null;
  email: string | null;
  website: string | null;
  industry: string | null;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
  owner_id: string;
};

export type UpdateCustomerInput = {
  company_name: string;
  contact_first_name: string | null;
  contact_last_name: string | null;
  email: string | null;
  website: string | null;
  industry: string | null;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
};

export type CustomerNote = {
  id: string;
  customer_id: string;
  owner_id: string;
  body: string;
  created_at: string;
};

export type CreateCustomerNoteInput = {
  customer_id: string;
  owner_id: string;
  body: string;
};

export type CustomerSortOption =
  | "newest"
  | "oldest"
  | "company_name"
  | "updated_desc";

export type CustomerCrmStats = {
  total: number;
  openLeads: number;
  proposals: number;
  won: number;
};
