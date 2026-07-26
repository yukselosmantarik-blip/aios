/**
 * GENERATED STYLE FILE — Sprint 8.2D
 */

export const theme = {
  "mode": "light",
  "colors": {
    "primaryColor": "#111111",
    "secondaryColor": "#F59E0B",
    "accentColor": "#F59E0B",
    "backgroundColor": "#FFFFFF",
    "surfaceColor": "#FAFAFA",
    "textColor": "#111827",
    "mutedColor": "#6B7280"
  },
  "typography": {
    "headingFont": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "bodyFont": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "clamp(1.5rem, 2.5vw, 2rem)",
      "display": "clamp(2.25rem, 4vw, 3rem)"
    },
    "fontWeights": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeights": {
      "tight": 1.2,
      "snug": 1.35,
      "normal": 1.5,
      "relaxed": 1.65
    }
  },
  "spacing": {
    "xs": "0.75rem",
    "sm": "1rem",
    "md": "1.5rem",
    "lg": "5rem",
    "xl": "4rem",
    "2xl": "6rem"
  },
  "radius": {
    "small": "0.375rem",
    "medium": "0.75rem",
    "large": "1rem",
    "pill": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 12px rgba(0,0,0,0.08)",
    "lg": "0 12px 32px rgba(0,0,0,0.12)",
    "xl": "0 20px 40px rgba(0,0,0,0.14)"
  },
  "breakpoints": {
    "mobile": "640px",
    "tablet": "768px",
    "desktop": "1024px"
  },
  "container": {
    "mobile": "100%",
    "tablet": "65ch",
    "desktop": "80rem"
  },
  "zIndex": {
    "base": 0,
    "header": 40,
    "sticky": 30,
    "modal": 50
  },
  "darkMode": {
    "prepared": true,
    "colors": {
      "primaryColor": "#111111",
      "secondaryColor": "#F59E0B",
      "accentColor": "#F59E0B",
      "backgroundColor": "#0B0B0B",
      "surfaceColor": "#141414",
      "textColor": "#F5F5F5",
      "mutedColor": "#A3A3A3"
    }
  }
} as const;

export type Theme = typeof theme;
