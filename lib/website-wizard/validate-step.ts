import type {
  StandaloneWebsiteWizardState,
  StandaloneWebsiteWizardStepId,
} from "@/lib/website-wizard/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function validateStandaloneWebsiteWizardStep(
  stepId: StandaloneWebsiteWizardStepId,
  state: StandaloneWebsiteWizardState,
): string | undefined {
  switch (stepId) {
    case "customer":
      if (!state.customer_id.trim()) {
        return "Bitte wählen Sie einen Kunden aus.";
      }
      if (!state.business_name.trim()) {
        return "Bitte geben Sie einen Unternehmensnamen ein.";
      }
      if (!state.industry.trim()) {
        return "Bitte geben Sie eine Branche an.";
      }
      if (!state.business_description.trim()) {
        return "Bitte geben Sie eine kurze Unternehmensbeschreibung ein.";
      }
      return undefined;
    case "goals":
      if (!state.website_goal.trim()) {
        return "Bitte beschreiben Sie das Hauptziel der Website.";
      }
      if (!state.target_audience.trim()) {
        return "Bitte beschreiben Sie die Zielgruppe.";
      }
      if (!state.services.trim()) {
        return "Bitte nennen Sie Hauptleistungen oder Produkte.";
      }
      if (!state.call_to_action.trim()) {
        return "Bitte definieren Sie die gewünschte Handlungsaufforderung (CTA).";
      }
      return undefined;
    case "content":
      if (!state.about_content.trim()) {
        return "Bitte geben Sie Informationen für „Über uns“ ein.";
      }
      if (
        state.contact_email.trim() &&
        !EMAIL_PATTERN.test(state.contact_email.trim())
      ) {
        return "Bitte geben Sie eine gültige Kontakt-E-Mail ein.";
      }
      return undefined;
    case "design":
      if (!state.preferred_style.trim()) {
        return "Bitte wählen oder beschreiben Sie einen visuellen Stil.";
      }
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
    case "pages":
      if (state.selected_pages.length === 0) {
        return "Bitte wählen Sie mindestens eine Seite aus.";
      }
      if (state.selected_features.length === 0) {
        return "Bitte wählen Sie mindestens eine Funktion aus.";
      }
      return undefined;
    case "summary":
      return (
        validateStandaloneWebsiteWizardStep("customer", state) ??
        validateStandaloneWebsiteWizardStep("goals", state) ??
        validateStandaloneWebsiteWizardStep("content", state) ??
        validateStandaloneWebsiteWizardStep("design", state) ??
        validateStandaloneWebsiteWizardStep("pages", state)
      );
    default:
      return undefined;
  }
}
