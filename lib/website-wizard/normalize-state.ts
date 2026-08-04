import {
  EMPTY_STANDALONE_WIZARD_STATE,
  type StandaloneWebsiteWizardState,
  type ThemePreference,
} from "@/lib/website-wizard/types";

function normalizeThemePreference(value: unknown): ThemePreference {
  if (value === "dark" || value === "auto" || value === "light") {
    return value;
  }
  return "light";
}

export function normalizeStandaloneWebsiteWizardState(
  input: Partial<StandaloneWebsiteWizardState> | StandaloneWebsiteWizardState,
): StandaloneWebsiteWizardState {
  return {
    customer_id: input.customer_id ?? "",
    business_name: input.business_name ?? "",
    industry: input.industry ?? "",
    business_description: input.business_description ?? "",
    website_goal: input.website_goal ?? "",
    target_audience: input.target_audience ?? "",
    services: input.services ?? "",
    unique_selling_points: input.unique_selling_points ?? "",
    call_to_action: input.call_to_action ?? "",
    about_content: input.about_content ?? "",
    contact_phone: input.contact_phone ?? "",
    contact_email: input.contact_email ?? "",
    contact_address: input.contact_address ?? "",
    social_media: input.social_media ?? "",
    opening_hours: input.opening_hours ?? "",
    content_notes: input.content_notes ?? "",
    preferred_style: input.preferred_style ?? "",
    primary_color: input.primary_color ?? EMPTY_STANDALONE_WIZARD_STATE.primary_color,
    secondary_color:
      input.secondary_color ?? EMPTY_STANDALONE_WIZARD_STATE.secondary_color,
    theme_preference: normalizeThemePreference(input.theme_preference),
    reference_websites: input.reference_websites ?? "",
    logo_storage_path: input.logo_storage_path ?? "",
    logo_draft_id: input.logo_draft_id ?? "",
    selected_pages: Array.isArray(input.selected_pages)
      ? input.selected_pages.filter((item): item is string => typeof item === "string")
      : [...EMPTY_STANDALONE_WIZARD_STATE.selected_pages],
    selected_features: Array.isArray(input.selected_features)
      ? input.selected_features.filter((item): item is string => typeof item === "string")
      : [...EMPTY_STANDALONE_WIZARD_STATE.selected_features],
  };
}
