export type WebsiteBriefWizardStepId =
  | "business"
  | "industry"
  | "brand"
  | "audience"
  | "services"
  | "contact"
  | "social"
  | "logo"
  | "style"
  | "review";

export type WebsiteBriefWizardState = {
  business_name: string;
  industry: string;
  primary_color: string;
  secondary_color: string;
  target_audience: string;
  services: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  location: string;
  social_instagram: string;
  social_facebook: string;
  social_linkedin: string;
  social_other: string;
  preferred_style: string;
  website_goal: string;
};

export const EMPTY_WIZARD_STATE: WebsiteBriefWizardState = {
  business_name: "",
  industry: "",
  primary_color: "#0F766E",
  secondary_color: "#0369A1",
  target_audience: "",
  services: "",
  contact_phone: "",
  contact_email: "",
  contact_address: "",
  location: "",
  social_instagram: "",
  social_facebook: "",
  social_linkedin: "",
  social_other: "",
  preferred_style: "",
  website_goal: "",
};
