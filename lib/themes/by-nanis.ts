import type { WebsiteTheme } from "@/lib/themes/types";

/** Premium black, warm cream, red and gold — restrained, no glass or neon. */
export const BY_NANIS_WEBSITE_THEME: WebsiteTheme = {
  colors: {
    background: "#090909",
    surface: "#121212",
    surfaceElevated: "#191919",
    text: "#FFF8EA",
    textMuted: "#B8B1A5",
    primary: "#D71920",
    primaryHover: "#F02A30",
    secondary: "#D6A84B",
    border: "rgba(214, 168, 75, 0.24)",
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
    sectionSpacing: "5rem",
    contentPadding: "1.5rem",
    navigationHeight: "4.5rem",
  },
  radius: {
    small: "0.375rem",
    medium: "0.625rem",
    large: "1rem",
    pill: "9999px",
  },
  shadows: {
    small: "0 1px 2px rgba(0, 0, 0, 0.45)",
    medium: "0 6px 20px rgba(0, 0, 0, 0.4)",
    large: "0 16px 40px rgba(0, 0, 0, 0.45)",
  },
  motion: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
