/**
 * GENERATED COMPONENT DESCRIPTOR — Sprint 8.2A
 * Component: ProductCard
 * No JSX in this sprint.
 */

export const ProductCardDescriptor = {
  "id": "component:productcard",
  "name": "ProductCard",
  "category": "content",
  "purpose": "Product/menu card",
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

export type ProductCardDescriptor = typeof ProductCardDescriptor;
