/**
 * AIOS Core — shared engine contracts (re-exports).
 * Legacy import paths remain valid; prefer `@/lib/core` for new code.
 */
export type { WebsiteBrief } from "@/lib/website-briefs.types";
export type { WebsiteBlueprintContent } from "@/lib/website-blueprints.types";

export type {
  CompiledWebsiteProject,
  CompileResult,
  WebsiteCompilerInput,
  CompilerGenerationMode,
} from "@/lib/website-compiler/types";

export type {
  GeneratedNextJsProject,
  ProjectGeneratorInput,
  ProjectGeneratorResult,
  VirtualFile,
} from "@/lib/project-generator/types";

export type {
  ExportableWebsiteProject,
  ZipExportResult,
} from "@/lib/project-export/types";

/** Stages of the website generation pipeline. */
export type WebsiteEnginePipelineStage =
  | "brief"
  | "blueprint"
  | "compile"
  | "generate"
  | "export";
