import type { PatternId } from "@/lib/website-blueprint-pattern-library";

/**
 * Logical section ids for industry page composition (future).
 * Not yet wired to the project generator.
 */
export type SectionId =
  | "hero"
  | "about"
  | "services"
  | "menu"
  | "gallery"
  | "testimonials"
  | "faq"
  | "contact"
  | "map"
  | "footer"
  | "cta";

export type SectionCategory =
  | "hero"
  | "content"
  | "offerings"
  | "social-proof"
  | "conversion"
  | "local"
  | "chrome";

export type SectionKind = "page-section" | "site-chrome";

/**
 * Planned mapping to generated React components (Sprint 8.x names).
 * Used for documentation and future generator dispatch — not active yet.
 */
export type SectionComponentBinding = {
  primary: string;
  alternates?: readonly string[];
};

export type SectionRegistration = {
  id: SectionId;
  label: string;
  category: SectionCategory;
  kind: SectionKind;
  /** Pattern library ids this section typically implements. */
  patternIds: readonly PatternId[];
  /**
   * Intended generated component binding when sections are migrated
   * onto the registry (see `ALL_GENERATED_COMPONENTS`).
   */
  componentBinding?: SectionComponentBinding;
  metadata?: {
    description?: string;
  };
};

export type SectionRegistrySnapshot = {
  sections: SectionRegistration[];
  count: number;
};
