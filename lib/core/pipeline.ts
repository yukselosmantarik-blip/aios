import { createZipExport } from "@/lib/project-export/zip-export";
import { generateNextJsProject } from "@/lib/project-generator/generator";
import type { ProjectGeneratorResult } from "@/lib/project-generator/types";
import { compileWebsiteProject } from "@/lib/website-compiler/compile";
import type {
  CompileResult,
  WebsiteCompilerInput,
} from "@/lib/website-compiler/types";

/**
 * Compile a website brief + blueprint into a structured project model.
 */
export function compileWebsite(input: WebsiteCompilerInput): CompileResult {
  return compileWebsiteProject(input);
}

/**
 * Generate a Next.js virtual file tree from a compiled project.
 */
export function generateWebsite(
  input: WebsiteCompilerInput,
  generatedAt?: string,
): ProjectGeneratorResult {
  const { project } = compileWebsiteProject(input);
  return generateNextJsProject({
    project,
    generatedAt: generatedAt ?? project.metadata.generatedAt,
  });
}

/**
 * Compile and generate in one step (no ZIP).
 */
export function compileAndGenerateWebsite(
  input: WebsiteCompilerInput,
  generatedAt?: string,
): ProjectGeneratorResult {
  return generateWebsite(input, generatedAt);
}

export type ZipWebsiteExportOptions = {
  generationTime?: string;
  skipVerification?: boolean;
};

/**
 * Full pipeline through export package + ZIP bytes.
 */
export async function compileGenerateAndZipWebsite(
  input: WebsiteCompilerInput,
  options: ZipWebsiteExportOptions = {},
) {
  const generatedAt = options.generationTime ?? input.generatedAt ?? new Date().toISOString();
  const compileResult = compileWebsiteProject(input);
  const generatorResult = generateNextJsProject({
    project: compileResult.project,
    generatedAt,
  });
  const zipExport = await createZipExport(generatorResult.exportPackage, {
    generationTime: generatedAt,
    skipVerification: options.skipVerification,
  });

  return {
    compileResult,
    generated: generatorResult.generated,
    exportPackage: generatorResult.exportPackage,
    zipExport,
  };
}
