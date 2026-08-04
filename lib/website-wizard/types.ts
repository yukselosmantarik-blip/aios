export type StandaloneWebsiteWizardStepId =
  | "customer"
  | "goals"
  | "content"
  | "design"
  | "pages"
  | "summary";

export type ThemePreference = "light" | "dark" | "auto";

export type StandaloneWebsiteWizardState = {
  customer_id: string;
  business_name: string;
  industry: string;
  business_description: string;
  website_goal: string;
  target_audience: string;
  services: string;
  unique_selling_points: string;
  call_to_action: string;
  about_content: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  social_media: string;
  opening_hours: string;
  content_notes: string;
  preferred_style: string;
  primary_color: string;
  secondary_color: string;
  theme_preference: ThemePreference;
  reference_websites: string;
  logo_storage_path: string;
  logo_draft_id: string;
  selected_pages: string[];
  selected_features: string[];
};

export const EMPTY_STANDALONE_WIZARD_STATE: StandaloneWebsiteWizardState = {
  customer_id: "",
  business_name: "",
  industry: "",
  business_description: "",
  website_goal: "",
  target_audience: "",
  services: "",
  unique_selling_points: "",
  call_to_action: "",
  about_content: "",
  contact_phone: "",
  contact_email: "",
  social_media: "",
  opening_hours: "",
  content_notes: "",
  contact_address: "",
  preferred_style: "",
  primary_color: "#0F766E",
  secondary_color: "#0369A1",
  theme_preference: "light",
  reference_websites: "",
  logo_storage_path: "",
  logo_draft_id: "",
  selected_pages: ["Home", "About", "Services", "Contact", "Legal pages"],
  selected_features: ["Contact form", "Social links"],
};
