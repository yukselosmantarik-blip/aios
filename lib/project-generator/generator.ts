import { buildAllVirtualFiles } from "@/lib/project-generator/files";
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
  const { files, routes, componentDescriptors } = buildAllVirtualFiles(project);
  const sortedFiles = sortVirtualFiles(files);

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
