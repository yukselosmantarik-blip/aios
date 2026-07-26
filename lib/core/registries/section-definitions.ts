import type { SectionRegistration } from "@/lib/core/registries/section-types";

/**
 * Built-in reusable sections for industry composition (metadata only).
 * Generator still uses existing section switches until a later milestone.
 */
export const BUILTIN_SECTION_DEFINITIONS: readonly SectionRegistration[] = [
  {
    id: "hero",
    label: "Hero",
    category: "hero",
    kind: "page-section",
    patternIds: ["hero"],
    componentBinding: { primary: "HeroSection" },
    metadata: { description: "Primary above-the-fold message and primary CTA." },
  },
  {
    id: "about",
    label: "About",
    category: "content",
    kind: "page-section",
    patternIds: ["feature-grid", "usp-block"],
    componentBinding: { primary: "ContentSection", alternates: ["GenericSection"] },
    metadata: { description: "Brand story, mission, and trust narrative." },
  },
  {
    id: "services",
    label: "Services",
    category: "offerings",
    kind: "page-section",
    patternIds: ["feature-grid", "pricing"],
    componentBinding: {
      primary: "FeatureGridSection",
      alternates: ["ProductGridSection"],
    },
    metadata: { description: "Service or product overview grids." },
  },
  {
    id: "menu",
    label: "Menu",
    category: "offerings",
    kind: "page-section",
    patternIds: ["menu-grid", "pricing"],
    componentBinding: {
      primary: "MenuSection",
      alternates: ["MenuImageSection"],
    },
    metadata: { description: "Menu listings or menu imagery (restaurant vertical)." },
  },
  {
    id: "gallery",
    label: "Gallery",
    category: "content",
    kind: "page-section",
    patternIds: ["gallery"],
    componentBinding: { primary: "GallerySection" },
    metadata: { description: "Photo or media gallery." },
  },
  {
    id: "testimonials",
    label: "Testimonials",
    category: "social-proof",
    kind: "page-section",
    patternIds: ["testimonials"],
    componentBinding: { primary: "TestimonialSection" },
    metadata: { description: "Reviews and customer quotes." },
  },
  {
    id: "faq",
    label: "FAQ",
    category: "content",
    kind: "page-section",
    patternIds: ["faq"],
    componentBinding: { primary: "FAQSection" },
    metadata: { description: "Frequently asked questions." },
  },
  {
    id: "contact",
    label: "Contact",
    category: "local",
    kind: "page-section",
    patternIds: ["feature-grid", "location"],
    componentBinding: {
      primary: "ContactSection",
      alternates: ["ContactForm", "BusinessInfoSection"],
    },
    metadata: { description: "Contact details and inquiry form." },
  },
  {
    id: "map",
    label: "Map",
    category: "local",
    kind: "page-section",
    patternIds: ["location"],
    componentBinding: {
      primary: "MapSection",
      alternates: ["LocationSection"],
    },
    metadata: { description: "Map embed and location context." },
  },
  {
    id: "footer",
    label: "Footer",
    category: "chrome",
    kind: "site-chrome",
    patternIds: ["footer"],
    componentBinding: { primary: "SiteFooter" },
    metadata: { description: "Global footer navigation and legal links." },
  },
  {
    id: "cta",
    label: "Call to action",
    category: "conversion",
    kind: "page-section",
    patternIds: ["cta-banner", "reservation-block"],
    componentBinding: {
      primary: "CTASection",
      alternates: ["MobileStickyCTA"],
    },
    metadata: { description: "Conversion band or sticky mobile CTA." },
  },
] as const;
