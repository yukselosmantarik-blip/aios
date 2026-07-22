export type CustomerStatus =
  | "lead"
  | "contacted"
  | "meeting"
  | "proposal"
  | "customer"
  | "inactive";

export const CUSTOMER_STATUSES: CustomerStatus[] = [
  "lead",
  "contacted",
  "meeting",
  "proposal",
  "customer",
  "inactive",
];

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
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type CreateCustomerInput = {
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  website: string | null;
  industry: string | null;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
  owner_id: string;
};

export type UpdateCustomerInput = {
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  website: string | null;
  industry: string | null;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
};
