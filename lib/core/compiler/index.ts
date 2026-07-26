export { compileWebsiteProject } from "@/lib/website-compiler/compile";

export type {
  CompiledWebsiteProject,
  CompileResult,
  WebsiteCompilerInput,
  CompilerGenerationMode,
  ProjectMetadata,
  BusinessMetadata,
} from "@/lib/website-compiler/types";

export { COMPILER_VERSION } from "@/lib/website-compiler/types";

export { serializeCompiledWebsiteProject } from "@/lib/website-compiler/compile";
