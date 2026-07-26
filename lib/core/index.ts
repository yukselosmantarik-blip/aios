/**
 * AIOS Website Generation Engine — core entry point.
 *
 * Pipeline: Brief → Blueprint → Compile → Generate → Export
 *
 * Existing `@/lib/website-compiler`, `@/lib/project-generator`, and
 * `@/lib/project-export` paths remain supported.
 */

export * from "@/lib/core/constants";
export * from "@/lib/core/types";
export * from "@/lib/core/pipeline";

export * as brief from "@/lib/core/brief";
export * as blueprint from "@/lib/core/blueprint";
export * as compiler from "@/lib/core/compiler";
export * as generator from "@/lib/core/generator";
export * as exportEngine from "@/lib/core/export";

export * as samples from "@/lib/core/samples";
export * as registries from "@/lib/core/registries";

export { runCoreEngineSmokeChecks } from "@/lib/core/verify";
export type { CoreEngineSmokeReport } from "@/lib/core/verify";
