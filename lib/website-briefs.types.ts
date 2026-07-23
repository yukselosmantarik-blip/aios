export type WebsiteBriefStatus = "draft" | "ready" | "completed";

export const WEBSITE_BRIEF_STATUSES: WebsiteBriefStatus[] = [
  "draft",
  "ready",
  "completed",
];

export const WEBSITE_BRIEF_STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf" },
  { value: "ready", label: "Bereit" },
  { value: "completed", label: "Abgeschlossen" },
] as const;

export type WebsiteBrief = {
  id: string;
  user_id: string;
  agent_id: string;
  customer_id: string | null;
  project_id: string | null;
  business_name: string;
  industry: string;
  location: string | null;
  website_goal: string;
  target_audience: string;
  services: string | null;
  unique_selling_points: string | null;
  preferred_style: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  required_pages: string | null;
  required_features: string | null;
  reference_websites: string | null;
  additional_notes: string | null;
  status: WebsiteBriefStatus;
  created_at: string;
  updated_at: string;
};

export type CreateWebsiteBriefInput = {
  user_id: string;
  agent_id: string;
  customer_id: string | null;
  project_id: string | null;
  business_name: string;
  industry: string;
  location: string | null;
  website_goal: string;
  target_audience: string;
  services: string | null;
  unique_selling_points: string | null;
  preferred_style: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  required_pages: string | null;
  required_features: string | null;
  reference_websites: string | null;
  additional_notes: string | null;
  status: WebsiteBriefStatus;
};

export type UpdateWebsiteBriefInput = {
  customer_id: string | null;
  project_id: string | null;
  business_name: string;
  industry: string;
  location: string | null;
  website_goal: string;
  target_audience: string;
  services: string | null;
  unique_selling_points: string | null;
  preferred_style: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  required_pages: string | null;
  required_features: string | null;
  reference_websites: string | null;
  additional_notes: string | null;
  status: WebsiteBriefStatus;
};
