/**
 * GENERATED SHARED TYPES — Sprint 8.3
 */

export type CTA = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'destructive';
  external?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export type PlaceholderCategory =
  | 'logo'
  | 'image'
  | 'price'
  | 'address'
  | 'phone'
  | 'email'
  | 'opening-hours'
  | 'testimonial'
  | 'legal'
  | 'map'
  | 'social-link'
  | 'product-data'
  | 'trust'
  | 'other';

export type CardVariant =
  | 'standard'
  | 'elevated'
  | 'bordered'
  | 'feature'
  | 'product'
  | 'testimonial'
  | 'media'
  | 'placeholder'
  | 'interactive';

export type MediaAssetId = 'logo' | 'favicon' | 'hero' | 'gallery' | 'product' | 'map' | 'avatar' | 'menu';

export type MediaPlaceholderModel = {
  id: string;
  label: string;
  aspectRatio?: string;
  altText?: string;
  assetId?: MediaAssetId;
};

export type NavigationItemModel = {
  label: string;
  href: string;
};

export type ContentBlockModel = {
  id: string;
  type: string;
  content: string;
  isPlaceholder: boolean;
};

export type ProductMenuItemPlaceholder = {
  id: string;
  name: string;
  description?: string;
  priceLabel?: string;
  allergenLabel?: string;
  dietaryLabel?: string;
  availabilityLabel?: string;
  featured?: boolean;
  category?: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  isPlaceholder: boolean;
  category?: string;
};

export type TestimonialPlaceholder = {
  id: string;
  quote: string;
  author: string;
  isConfirmed: boolean;
};

export type ContactDetailsModel = {
  phone?: string;
  email?: string;
  address?: string;
};

export type OpeningHoursPlaceholder = {
  id: string;
  label: string;
  value: string;
};

export type MissingDataReference = {
  field: string;
  label: string;
};

export type SectionBaseProps = {
  id: string;
  title: string;
  name: string;
  eyebrow: string | null;
  description: string;
  type: string;
  order: number;
  priority: number;
  hierarchyLevel: string;
  visualWeight: string;
  purpose: string;
  componentName: string;
  isPlaceholder: boolean;
  missingData: readonly string[];
  contentBlocks: readonly string[];
  primaryCTA: string | null;
  secondaryCTA: string | null;
  media: readonly string[];
  ctaReferences: readonly string[];
  mediaReferences: readonly string[];
  headingLevel: 1 | 2 | 3;
  sourcePatternIds: readonly string[];
  className?: string;
  heroLayout?: 'premium-restaurant' | 'legacy';
  tagline?: string | null;
  primaryCtaHref?: string;
  secondaryCtaHref?: string;
  phone?: string | null;
  address?: string | null;
};

export type SectionComponentProps = {
  section: SectionBaseProps;
};
