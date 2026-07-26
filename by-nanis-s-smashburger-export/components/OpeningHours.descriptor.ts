/**
 * GENERATED COMPONENT DESCRIPTOR — Sprint 8.2A
 * Component: OpeningHours
 * No JSX in this sprint.
 */

export const OpeningHoursDescriptor = {
  "id": "component:openinghours",
  "name": "OpeningHours",
  "category": "utility",
  "purpose": "Opening hours table",
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
    "page:kontakt"
  ],
  "missingDataRequirements": [],
  "implementationStatus": "descriptor-only"
} as const;

export type OpeningHoursDescriptor = typeof OpeningHoursDescriptor;
