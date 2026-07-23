import type { WebsiteBlueprintContent } from "@/lib/website-blueprints.types";

export const WEBSITE_BLUEPRINT_LIMITS = {
  textFieldMaxLength: 10000,
  masterPromptMaxLength: 150000,
  arrayItemMaxLength: 1200,
  pageKeyMaxLength: 100,
} as const;

const WEBSITE_BLUEPRINT_CONTENT_KEYS = [
  "projectSummary",
  "targetAudienceSummary",
  "brandDirection",
  "recommendedSitemap",
  "recommendedPageSections",
  "features",
  "contentRequirements",
  "seoBasics",
  "technicalRecommendation",
  "implementationChecklist",
  "masterPrompt",
] as const satisfies readonly (keyof WebsiteBlueprintContent)[];

type WebsiteBlueprintContentKey = (typeof WEBSITE_BLUEPRINT_CONTENT_KEYS)[number];

function hasOnlyKnownKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).every((key) =>
    WEBSITE_BLUEPRINT_CONTENT_KEYS.includes(key as WebsiteBlueprintContentKey),
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPageSectionsRecord(
  value: unknown,
): value is Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((sections) => isStringArray(sections));
}

function validateNonEmptyTextField(
  value: unknown,
  fieldLabel: string,
  maxLength: number,
): string | null {
  if (!isNonEmptyString(value)) {
    return `${fieldLabel} ist erforderlich.`;
  }

  if (value.length > maxLength) {
    return `${fieldLabel} ist zu lang (max. ${maxLength} Zeichen).`;
  }

  return null;
}

function validateNonEmptyStringArray(
  value: unknown,
  fieldLabel: string,
): string | null {
  if (!isStringArray(value) || value.length === 0) {
    return `${fieldLabel} muss mindestens einen Eintrag enthalten.`;
  }

  for (const item of value) {
    if (!item.trim()) {
      return `${fieldLabel} enthält ungültige leere Einträge.`;
    }

    if (item.length > WEBSITE_BLUEPRINT_LIMITS.arrayItemMaxLength) {
      return `${fieldLabel} enthält Einträge, die zu lang sind (max. ${WEBSITE_BLUEPRINT_LIMITS.arrayItemMaxLength} Zeichen).`;
    }
  }

  return null;
}

function validatePageSections(
  value: unknown,
): string | null {
  if (!isPageSectionsRecord(value)) {
    return "Seitenstruktur ist ungültig.";
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return "Seitenstruktur muss mindestens eine Seite enthalten.";
  }

  for (const [page, sections] of entries) {
    if (!page.trim()) {
      return "Seitenstruktur enthält ungültige leere Seitennamen.";
    }

    if (page.length > WEBSITE_BLUEPRINT_LIMITS.pageKeyMaxLength) {
      return `Seitenname "${page}" ist zu lang (max. ${WEBSITE_BLUEPRINT_LIMITS.pageKeyMaxLength} Zeichen).`;
    }

    if (sections.length === 0) {
      return `Seite "${page}" muss mindestens einen Abschnitt enthalten.`;
    }

    for (const section of sections) {
      if (!section.trim()) {
        return `Seite "${page}" enthält ungültige leere Abschnitte.`;
      }

      if (section.length > WEBSITE_BLUEPRINT_LIMITS.arrayItemMaxLength) {
        return `Seite "${page}" enthält Abschnitte, die zu lang sind.`;
      }
    }
  }

  return null;
}

export function isWebsiteBlueprintContent(
  value: unknown,
): value is WebsiteBlueprintContent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const content = value as WebsiteBlueprintContent;

  return (
    isNonEmptyString(content.projectSummary) &&
    isNonEmptyString(content.targetAudienceSummary) &&
    isNonEmptyString(content.brandDirection) &&
    isStringArray(content.recommendedSitemap) &&
    isPageSectionsRecord(content.recommendedPageSections) &&
    isStringArray(content.features) &&
    isStringArray(content.contentRequirements) &&
    isStringArray(content.seoBasics) &&
    isNonEmptyString(content.technicalRecommendation) &&
    isStringArray(content.implementationChecklist) &&
    isNonEmptyString(content.masterPrompt)
  );
}

export function validateWebsiteBlueprintContent(
  value: unknown,
):
  | { ok: true; data: WebsiteBlueprintContent }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Blueprint-Inhalt ist ungültig." };
  }

  const content = value as Record<string, unknown>;

  if (!hasOnlyKnownKeys(content)) {
    return { ok: false, error: "Blueprint-Inhalt enthält unbekannte Felder." };
  }

  const fieldChecks: Array<string | null> = [
    validateNonEmptyTextField(
      content.projectSummary,
      "Projektübersicht",
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    validateNonEmptyTextField(
      content.targetAudienceSummary,
      "Zielgruppe",
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    validateNonEmptyTextField(
      content.brandDirection,
      "Markenrichtung",
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    validateNonEmptyStringArray(content.recommendedSitemap, "Sitemap"),
    validatePageSections(content.recommendedPageSections),
    validateNonEmptyStringArray(content.features, "Features"),
    validateNonEmptyStringArray(content.contentRequirements, "Inhaltsanforderungen"),
    validateNonEmptyStringArray(content.seoBasics, "SEO"),
    validateNonEmptyTextField(
      content.technicalRecommendation,
      "Technische Empfehlung",
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    validateNonEmptyStringArray(
      content.implementationChecklist,
      "Checkliste",
    ),
    validateNonEmptyTextField(
      content.masterPrompt,
      "Master Prompt",
      WEBSITE_BLUEPRINT_LIMITS.masterPromptMaxLength,
    ),
  ];

  const firstError = fieldChecks.find((message) => message !== null);

  if (firstError) {
    return { ok: false, error: firstError };
  }

  return { ok: true, data: content as WebsiteBlueprintContent };
}
