import type { BusinessProfile } from "@/lib/website-blueprint-page-dna";

/**
 * Industry identifier. Aligns with blueprint/compiler `BusinessProfile` today.
 * Additional industries will extend this union in future milestones.
 */
export type IndustryId = BusinessProfile;

export type IndustryRegistration = {
  id: IndustryId;
  /** Human-readable label for tooling and UI (future). */
  label: string;
  /** Default page names when the brief does not list `required_pages`. */
  defaultSitemap: readonly string[];
  /**
   * Optional future hooks (not invoked by the engine yet):
   * required brief fields, section allowlists, theme ids, asset slots.
   */
  metadata?: {
    description?: string;
  };
};

export type IndustryRegistrySnapshot = {
  industries: IndustryRegistration[];
  count: number;
};
