/**
 * GENERATED COMPONENT DESCRIPTOR — Sprint 8.2A
 * Component: SiteHeader
 * No JSX in this sprint.
 */

export const SiteHeaderDescriptor = {
  "id": "component:siteheader",
  "name": "SiteHeader",
  "category": "navigation",
  "purpose": "Global header navigation",
  "propsSchema": {
    "title": "string",
    "description": "string",
    "ctaLabel": "string | optional",
    "items": "array | optional"
  },
  "variants": [
    "default",
    "compact"
  ],
  "states": [
    "default",
    "hover",
    "focus",
    "disabled",
    "loading"
  ],
  "responsiveBehavior": "Mobile-first stack; desktop grid where applicable",
  "accessibilityRequirements": [
    "Keyboard accessible",
    "Visible focus",
    "Semantic landmarks where applicable"
  ],
  "motionBehavior": "Respect prefers-reduced-motion",
  "designTokenReferences": [
    "color.primary",
    "font.h2",
    "spacing.block",
    "radius.md"
  ],
  "pageUsage": [
    "page:startseite",
    "page:speisekarte",
    "page:uber-uns",
    "page:galerie",
    "page:kontakt"
  ],
  "missingDataRequirements": [],
  "implementationStatus": "descriptor-only"
} as const;

export type SiteHeaderDescriptor = typeof SiteHeaderDescriptor;
