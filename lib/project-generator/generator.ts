import { buildAllVirtualFiles } from "@/lib/project-generator/files";
import { buildAssetEngineFiles } from "@/lib/project-generator/asset-files";
import { buildStyleEngineFiles } from "@/lib/project-generator/style-files";
import { buildVisualComponentRegistry } from "@/lib/project-generator/visual-component-registry";
import {
  buildVisualComponentFiles,
  countClientComponents,
  countVisualComponentFiles,
} from "@/lib/project-generator/visual-components";
import {
  buildReactPageFiles,
  countPageConfigFiles,
  countReactPages,
  countTsxFiles,
} from "@/lib/project-generator/react-pages";
import {
  assertUniqueFilePaths,
  collectDirectoriesFromFiles,
  sortVirtualFiles,
} from "@/lib/project-generator/tree";
import type {
  GeneratedNextJsProject,
  ProjectGeneratorInput,
  ProjectGeneratorResult,
} from "@/lib/project-generator/types";
import { GENERATOR_VERSION } from "@/lib/project-generator/types";

const REQUIRED_FOLDERS = [
  "app",
  "components",
  "lib",
  "styles",
  "public",
  "content",
  "types",
];

export function generateNextJsProject(input: ProjectGeneratorInput): ProjectGeneratorResult {
  const { project } = input;
  const generatedAt = input.generatedAt ?? project.metadata.generatedAt;
  const { files: baseFiles, routes, componentDescriptors } = buildAllVirtualFiles(project, {
    includeAppShells: false,
    includeJsonPageContent: false,
  });
  const styleFiles = buildStyleEngineFiles(project);
  const assetFiles = buildAssetEngineFiles(project);
  const componentFiles = buildVisualComponentFiles(project);
  const registryFile = buildVisualComponentRegistry(project);
  const reactFiles = buildReactPageFiles(project);
  const sortedFiles = sortVirtualFiles([
    ...baseFiles,
    ...styleFiles,
    ...assetFiles,
    ...componentFiles,
    registryFile,
    ...reactFiles,
  ]);

  assertUniqueFilePaths(sortedFiles);

  const directories = collectDirectoriesFromFiles(sortedFiles);

  const generated: GeneratedNextJsProject = {
    generatorVersion: GENERATOR_VERSION,
    sourceProjectId: project.metadata.projectId,
    sourceProjectName: project.metadata.projectName,
    generatedAt,
    targetFramework: "nextjs-app-router",
    rootDirectories: [...REQUIRED_FOLDERS],
    directories,
    files: sortedFiles,
    routes,
    componentDescriptors,
    requiredFolders: [...REQUIRED_FOLDERS],
  };

  return { generated };
}

export function summarizeReactGeneration(generated: GeneratedNextJsProject): {
  generatedTsxFileCount: number;
  generatedPageCount: number;
  generatedPageConfigCount: number;
  generatedComponentCount: number;
  generatedClientComponentCount: number;
} {
  return {
    generatedTsxFileCount: countTsxFiles(generated.files),
    generatedPageCount: countReactPages(generated.files),
    generatedPageConfigCount: countPageConfigFiles(generated.files),
    generatedComponentCount: countVisualComponentFiles(generated.files),
    generatedClientComponentCount: countClientComponents(generated.files),
  };
}
