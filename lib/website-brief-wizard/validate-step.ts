import type {
  WebsiteBriefWizardStepId,
  WebsiteBriefWizardState,
} from "@/lib/website-brief-wizard/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function validateWebsiteBriefWizardStep(
  stepId: WebsiteBriefWizardStepId,
  state: WebsiteBriefWizardState,
): string | undefined {
  switch (stepId) {
    case "business":
      if (!state.business_name.trim()) {
        return "Bitte geben Sie einen Unternehmensnamen ein.";
      }
      return undefined;
    case "industry":
      if (!state.industry.trim()) {
        return "Bitte wählen oder beschreiben Sie eine Branche.";
      }
      return undefined;
    case "brand": {
      if (
        state.primary_color.trim() &&
        !HEX_COLOR_PATTERN.test(state.primary_color.trim())
      ) {
        return "Primärfarbe: bitte gültigen Hex-Wert (#RRGGBB) verwenden.";
      }
      if (
        state.secondary_color.trim() &&
        !HEX_COLOR_PATTERN.test(state.secondary_color.trim())
      ) {
        return "Sekundärfarbe: bitte gültigen Hex-Wert (#RRGGBB) verwenden.";
      }
      return undefined;
    }
    case "audience":
      if (!state.target_audience.trim()) {
        return "Bitte beschreiben Sie die Zielgruppe.";
      }
      return undefined;
    case "services":
      return undefined;
    case "contact":
      if (
        state.contact_email.trim() &&
        !EMAIL_PATTERN.test(state.contact_email.trim())
      ) {
        return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
      }
      return undefined;
    case "social":
      return undefined;
    case "logo":
      return undefined;
    case "style":
      if (!state.preferred_style.trim()) {
        return "Bitte wählen oder beschreiben Sie einen Design-Stil.";
      }
      return undefined;
    case "review":
      return (
        validateWebsiteBriefWizardStep("business", state) ??
        validateWebsiteBriefWizardStep("industry", state) ??
        validateWebsiteBriefWizardStep("audience", state) ??
        validateWebsiteBriefWizardStep("style", state)
      );
    default:
      return undefined;
  }
}
