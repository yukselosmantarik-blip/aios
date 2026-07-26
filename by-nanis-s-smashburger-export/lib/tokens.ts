/**
 * GENERATED PROJECT SHELL — Sprint 8.2A
 * Design token export
 * React implementation is intentionally deferred.
 */

export const designTokens = {
  "designTokens": {
    "colors": {
      "name": "colors",
      "tokens": {
        "color.background": "#FFFFFF",
        "color.surface": "#FAFAFA",
        "color.surfaceElevated": "#FFFFFF",
        "color.primary": "#111111",
        "color.secondary": "#F59E0B",
        "color.accent": "#F59E0B",
        "color.muted": "#6B7280",
        "color.border": "#E5E7EB",
        "color.error": "#DC2626",
        "color.text": "#111827",
        "color.textMuted": "#6B7280"
      }
    },
    "typography": {
      "name": "typography",
      "tokens": {
        "font.displayXL": "clamp(3rem, 6vw, 4.5rem)",
        "font.displayL": "clamp(2.25rem, 4vw, 3rem)",
        "font.h1": "clamp(2rem, 3.5vw, 2.75rem)",
        "font.h2": "clamp(1.5rem, 2.5vw, 2rem)",
        "font.h3": "1.25rem",
        "font.h4": "1.125rem",
        "font.bodyLarge": "1.125rem",
        "font.body": "1rem",
        "font.bodySmall": "0.875rem",
        "font.label": "0.75rem",
        "font.caption": "0.75rem",
        "font.button": "0.875rem"
      }
    },
    "spacing": {
      "name": "spacing",
      "tokens": {
        "spacing.section": "5rem",
        "spacing.block": "1.5rem",
        "spacing.inline": "1rem",
        "spacing.stack": "0.75rem"
      }
    },
    "radius": {
      "name": "radius",
      "tokens": {
        "radius.sm": "0.375rem",
        "radius.md": "0.75rem",
        "radius.lg": "1rem",
        "radius.full": "9999px"
      }
    },
    "borders": {
      "name": "borders",
      "tokens": {
        "border.width": "1px",
        "border.style": "solid"
      }
    },
    "shadows": {
      "name": "shadows",
      "tokens": {
        "shadow.sm": "0 1px 2px rgba(0,0,0,0.05)",
        "shadow.md": "0 4px 12px rgba(0,0,0,0.08)",
        "shadow.lg": "0 12px 32px rgba(0,0,0,0.12)"
      }
    },
    "layoutWidths": {
      "name": "layoutWidths",
      "tokens": {
        "layout.maxWidth": "80rem",
        "layout.contentWidth": "65ch"
      }
    },
    "breakpoints": {
      "name": "breakpoints",
      "tokens": {
        "breakpoint.sm": "640px",
        "breakpoint.md": "768px",
        "breakpoint.lg": "1024px",
        "breakpoint.xl": "1280px"
      }
    },
    "transitions": {
      "name": "transitions",
      "tokens": {
        "transition.fast": "150ms",
        "transition.normal": "250ms",
        "transition.slow": "400ms"
      }
    },
    "easing": {
      "name": "easing",
      "tokens": {
        "easing.standard": "cubic-bezier(0.4, 0, 0.2, 1)",
        "easing.emphasized": "cubic-bezier(0.2, 0, 0, 1)"
      }
    },
    "zIndex": {
      "name": "zIndex",
      "tokens": {
        "zIndex.header": "40",
        "zIndex.sticky": "30",
        "zIndex.modal": "50"
      }
    },
    "mediaRatios": {
      "name": "mediaRatios",
      "tokens": {
        "ratio.16x9": "16 / 9",
        "ratio.4x3": "4 / 3",
        "ratio.1x1": "1 / 1"
      }
    }
  },
  "source": "compiled-website-project"
} as const;

export type designTokens = typeof designTokens;
