export {
  generateNextJsProject,
  generateProjectExport,
  summarizeReactGeneration,
} from "@/lib/project-generator/generator";

export type {
  GeneratedNextJsProject,
  ProjectGeneratorInput,
  ProjectGeneratorResult,
  VirtualFile,
} from "@/lib/project-generator/types";

export { GENERATOR_VERSION } from "@/lib/project-generator/types";

export { verifyGeneratedNextJsProject } from "@/lib/project-generator/verify";
