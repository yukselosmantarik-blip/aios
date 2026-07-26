import type { WebsiteTheme } from "@/lib/themes/types";

/** Clean, trustworthy local-service palette (no premium restaurant styling). */
export const SAMPLE_MUELLER_WEBSITE_THEME: WebsiteTheme = {
  colors: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceElevated: "#F1F5F9",
    text: "#0F172A",
    textMuted: "#475569",
    primary: "#0F766E",
    primaryHover: "#0D9488",
    secondary: "#0369A1",
    border: "rgba(15, 23, 42, 0.12)",
  },
  typography: {
    headingFont:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    bodyFont:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    headingWeight: 600,
    bodyWeight: 400,
    headingLetterSpacing: "-0.02em",
  },
  layout: {
    maxWidth: "72rem",
    sectionSpacing: "4.5rem",
    contentPadding: "1.5rem",
    navigationHeight: "4.25rem",
  },
  radius: {
    small: "0.375rem",
    medium: "0.625rem",
    large: "1rem",
    pill: "9999px",
  },
  shadows: {
    small: "0 1px 2px rgba(15, 23, 42, 0.06)",
    medium: "0 8px 24px rgba(15, 23, 42, 0.08)",
    large: "0 16px 40px rgba(15, 23, 42, 0.1)",
  },
  motion: {
    fast: "150ms",
    normal: "220ms",
    slow: "360ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
