import {
  ensureIndustryRegistryBootstrapped,
  getIndustryRegistration,
} from "@/lib/core/registries/industry-registry";
import { detectBusinessProfile } from "@/lib/website-compiler/normalize";
import type {
  CreateWebsiteBriefInput,
  UpdateWebsiteBriefInput,
  WebsiteBriefStatus,
} from "@/lib/website-briefs.types";
import type { WebsiteBriefWizardState } from "@/lib/website-brief-wizard/types";

function trimOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatSocialMedia(state: WebsiteBriefWizardState): string | null {
  const lines: string[] = [];

  if (state.social_instagram.trim()) {
    lines.push(`Instagram: ${state.social_instagram.trim()}`);
  }
  if (state.social_facebook.trim()) {
    lines.push(`Facebook: ${state.social_facebook.trim()}`);
  }
  if (state.social_linkedin.trim()) {
    lines.push(`LinkedIn: ${state.social_linkedin.trim()}`);
  }
  if (state.social_other.trim()) {
    lines.push(state.social_other.trim());
  }

  return lines.length > 0 ? lines.join("\n") : null;
}

function defaultWebsiteGoal(state: WebsiteBriefWizardState): string {
  if (state.website_goal.trim()) {
    return state.website_goal.trim();
  }

  const name = state.business_name.trim() || "das Unternehmen";
  return `${name} professionell präsentieren, Vertrauen aufbauen und qualifizierte Anfragen über die Website gewinnen.`;
}

function defaultRequiredPages(state: WebsiteBriefWizardState): string {
  ensureIndustryRegistryBootstrapped();
  const industryId = detectBusinessProfile(
    state.industry,
    state.business_name,
  );
  const registration = getIndustryRegistration(industryId);
  return (registration?.defaultSitemap ?? ["Home", "About", "Contact"]).join(
    "\n",
  );
}

function buildRequiredFeatures(state: WebsiteBriefWizardState): string {
  const features = ["Kontaktformular", "Impressum", "Datenschutz"];

  if (formatSocialMedia(state)) {
    features.push("Social-Media-Links");
  }

  if (state.services.trim()) {
    features.push("Leistungsübersicht");
  }

  return features.join(", ");
}

function buildAdditionalNotes(
  state: WebsiteBriefWizardState,
  logoStoragePath: string | null,
): string | null {
  const lines: string[] = [];

  if (state.contact_phone.trim() || state.contact_email.trim()) {
    lines.push("Kontakt (Wizard):");
    if (state.contact_phone.trim()) {
      lines.push(`Telefon: ${state.contact_phone.trim()}`);
    }
    if (state.contact_email.trim()) {
      lines.push(`E-Mail: ${state.contact_email.trim()}`);
    }
    if (state.contact_address.trim()) {
      lines.push(`Adresse: ${state.contact_address.trim()}`);
    }
  }

  if (logoStoragePath) {
    lines.push(`Logo: hochgeladen (${logoStoragePath})`);
  } else {
    lines.push("Logo: noch nicht hochgeladen — Platzhalter bis Lieferung.");
  }

  lines.push("Erstellt über den AI Website Wizard.");

  return lines.join("\n");
}

export function buildCreateWebsiteBriefInputFromWizard(
  state: WebsiteBriefWizardState,
  context: {
    user_id: string;
    agent_id: string;
    customer_id?: string | null;
    project_id?: string | null;
    logo_storage_path?: string | null;
    status?: WebsiteBriefStatus;
  },
): CreateWebsiteBriefInput {
  const logoPath = context.logo_storage_path ?? null;
  const socialMedia = formatSocialMedia(state);

  return {
    user_id: context.user_id,
    agent_id: context.agent_id,
    customer_id: context.customer_id ?? null,
    project_id: context.project_id ?? null,
    business_name: state.business_name.trim(),
    industry: state.industry.trim(),
    location: trimOrNull(state.location),
    website_goal: defaultWebsiteGoal(state),
    target_audience: state.target_audience.trim(),
    services: trimOrNull(state.services),
    unique_selling_points: null,
    preferred_style: trimOrNull(state.preferred_style),
    primary_color: trimOrNull(state.primary_color),
    secondary_color: trimOrNull(state.secondary_color),
    required_pages: defaultRequiredPages(state),
    required_features: buildRequiredFeatures(state),
    reference_websites: null,
    additional_notes: buildAdditionalNotes(state, logoPath),
    status: context.status ?? "ready",
    contact_phone: trimOrNull(state.contact_phone),
    contact_email: trimOrNull(state.contact_email),
    contact_address: trimOrNull(state.contact_address),
    social_media: socialMedia,
    logo_storage_path: logoPath,
  };
}

export function buildUpdateWebsiteBriefInputFromWizard(
  state: WebsiteBriefWizardState,
  context: {
    customer_id?: string | null;
    project_id?: string | null;
    logo_storage_path?: string | null;
    status?: WebsiteBriefStatus;
  },
): UpdateWebsiteBriefInput {
  const createShape = buildCreateWebsiteBriefInputFromWizard(state, {
    user_id: "",
    agent_id: "",
    ...context,
  });

  const {
    user_id: _userId,
    agent_id: _agentId,
    ...updateInput
  } = createShape;

  return updateInput;
}
