import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type { WebsiteCompilerInput } from "@/lib/website-compiler/types";
import { generateWebsiteBlueprintContent } from "@/lib/website-blueprint-generator";
import {
  SAMPLE_MUELLER_BUSINESS_PROFILE,
  SAMPLE_BUSINESS_BRIEF_ID,
} from "@/lib/industries/business/fixtures/sample-mueller-profile";
import { SAMPLE_MUELLER_WEBSITE_THEME } from "@/lib/industries/business/fixtures/sample-mueller-theme";

export function createSampleBusinessCompilerInput(
  briefOverrides?: Partial<WebsiteBrief>,
): WebsiteCompilerInput {
  const brief: WebsiteBrief = {
    id: SAMPLE_BUSINESS_BRIEF_ID,
    user_id: "d568b238-736b-4ab0-93e2-0816d488a0e7",
    agent_id: "9a7f18a6-1e7a-4ca7-8ff2-b9dd7f8f1f5a",
    customer_id: null,
    project_id: null,
    business_name: SAMPLE_MUELLER_BUSINESS_PROFILE.companyName,
    industry: "Lokaler Gebäudeservice und Facility Pflege",
    location: "Ulm",
    website_goal:
      "Neukunden gewinnen und Vertrauen für zuverlässige Gebäudereinigung schaffen",
    target_audience: "Hausverwaltungen, Praxen und Gewerbetreibende in Ulm",
    services:
      "Unterhaltsreinigung\r\nTreppenhausreinigung\r\nGlasreinigung\r\nSonderreinigung",
    unique_selling_points:
      "Feste Teams, flexible Zeiten, transparente Leistungsnachweise",
    preferred_style: "Modern, klar, vertrauenswürdig",
    primary_color: "#0F766E",
    secondary_color: "#0369A1",
    required_pages: "",
    required_features: "Kontaktformular, FAQ, Social Media Links",
    reference_websites: "",
    additional_notes: "Fokus auf lokale Sichtbarkeit und schnelle Anfragen.",
    status: "ready",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...briefOverrides,
  };

  const blueprint = generateWebsiteBlueprintContent(brief);

  return {
    brief,
    blueprint,
    sourceBlueprintId: "sample-blueprint-mueller-business",
    sourceBriefId: brief.id,
    generatedAt: "1970-01-01T00:00:00.000Z",
    generationMode: "deterministic",
    businessProfile: SAMPLE_MUELLER_BUSINESS_PROFILE,
    websiteTheme: SAMPLE_MUELLER_WEBSITE_THEME,
  };
}

export {
  SAMPLE_MUELLER_BUSINESS_PROFILE,
  SAMPLE_BUSINESS_BRIEF_ID,
} from "@/lib/industries/business/fixtures/sample-mueller-profile";
