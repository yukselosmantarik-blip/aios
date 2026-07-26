/**
 * AIOS Website Generation Engine — version identifiers.
 * Re-exported from legacy modules; single source for engine metadata.
 */
export { COMPILER_VERSION } from "@/lib/website-compiler/types";
export { GENERATOR_VERSION } from "@/lib/project-generator/types";
export {
  EXPORT_VERSION,
  ZIP_EXPORT_VERSION,
} from "@/lib/project-export/types";

/** Target framework for generated customer sites. */
export const GENERATED_SITE_FRAMEWORK = "nextjs-app-router" as const;
