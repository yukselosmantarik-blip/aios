import type {
  CreateWebsiteBriefInput,
  WebsiteBriefStatus,
} from "@/lib/website-briefs.types";
import type { StandaloneWebsiteWizardState } from "@/lib/website-wizard/types";

function trimOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function themeLabel(preference: StandaloneWebsiteWizardState["theme_preference"]): string {
  switch (preference) {
    case "dark":
      return "Dunkel";
    case "auto":
      return "Automatisch (System)";
    default:
      return "Hell";
  }
}

function buildAdditionalNotes(state: StandaloneWebsiteWizardState): string | null {
  const lines: string[] = [];

  if (state.business_description.trim()) {
    lines.push("Unternehmensbeschreibung:");
    lines.push(state.business_description.trim());
  }

  if (state.about_content.trim()) {
    lines.push("");
    lines.push("Über uns:");
    lines.push(state.about_content.trim());
  }

  if (state.opening_hours.trim()) {
    lines.push("");
    lines.push("Öffnungszeiten:");
    lines.push(state.opening_hours.trim());
  }

  if (state.content_notes.trim()) {
    lines.push("");
    lines.push("Weitere Hinweise:");
    lines.push(state.content_notes.trim());
  }

  if (state.call_to_action.trim()) {
    lines.push("");
    lines.push(`CTA: ${state.call_to_action.trim()}`);
  }

  lines.push("");
  lines.push(`Erstellt über Website Wizard (/website-wizard).`);
  lines.push(`Theme-Präferenz: ${themeLabel(state.theme_preference)}`);

  return lines.join("\n").trim() || null;
}

function buildPreferredStyle(state: StandaloneWebsiteWizardState): string | null {
  const base = state.preferred_style.trim();
  const theme = themeLabel(state.theme_preference);
  if (!base) {
    return theme;
  }
  return `${base} · ${theme}`;
}

export function buildCreateWebsiteBriefInputFromStandaloneWizard(
  state: StandaloneWebsiteWizardState,
  context: {
    user_id: string;
    agent_id: string;
    logo_storage_path?: string | null;
    status?: WebsiteBriefStatus;
  },
): CreateWebsiteBriefInput {
  const logoPath =
    context.logo_storage_path ?? trimOrNull(state.logo_storage_path);

  return {
    user_id: context.user_id,
    agent_id: context.agent_id,
    customer_id: state.customer_id.trim() || null,
    project_id: null,
    business_name: state.business_name.trim(),
    industry: state.industry.trim(),
    location: trimOrNull(state.contact_address),
    website_goal: state.website_goal.trim(),
    target_audience: state.target_audience.trim(),
    services: trimOrNull(state.services),
    unique_selling_points: trimOrNull(state.unique_selling_points),
    preferred_style: buildPreferredStyle(state),
    primary_color: trimOrNull(state.primary_color),
    secondary_color: trimOrNull(state.secondary_color),
    required_pages: state.selected_pages.join("\n"),
    required_features: state.selected_features.join("\n"),
    reference_websites: trimOrNull(state.reference_websites),
    additional_notes: buildAdditionalNotes(state),
    contact_phone: trimOrNull(state.contact_phone),
    contact_email: trimOrNull(state.contact_email),
    contact_address: trimOrNull(state.contact_address),
    social_media: trimOrNull(state.social_media),
    logo_storage_path: logoPath,
    status: context.status ?? "ready",
  };
}
