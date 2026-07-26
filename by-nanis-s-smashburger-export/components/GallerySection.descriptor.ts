/**
 * GENERATED COMPONENT DESCRIPTOR — Sprint 8.2A
 * Component: GallerySection
 * No JSX in this sprint.
 */

export const GallerySectionDescriptor = {
  "id": "component:gallery",
  "name": "GallerySection",
  "category": "media",
  "purpose": "Image gallery",
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
  "pageUsage": [],
  "missingDataRequirements": [],
  "implementationStatus": "descriptor-only"
} as const;

export type GallerySectionDescriptor = typeof GallerySectionDescriptor;
