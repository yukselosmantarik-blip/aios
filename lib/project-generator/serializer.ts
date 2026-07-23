import { stableStringify } from "@/lib/website-compiler/normalize";
import type {
  GeneratedNextJsProject,
  SerializedProjectTree,
} from "@/lib/project-generator/types";

export function serializeGeneratedProjectTree(
  generated: GeneratedNextJsProject,
  options?: { includeGeneratedAt?: boolean },
): SerializedProjectTree {
  const includeGeneratedAt = options?.includeGeneratedAt ?? true;

  return {
    generatorVersion: generated.generatorVersion,
    sourceProjectId: generated.sourceProjectId,
    sourceProjectName: generated.sourceProjectName,
    generatedAt: includeGeneratedAt ? generated.generatedAt : "1970-01-01T00:00:00.000Z",
    summary: {
      fileCount: generated.files.length,
      folderCount: generated.directories.length,
      routeCount: generated.routes.length,
      componentDescriptorCount: generated.componentDescriptors.length,
    },
    rootDirectories: generated.rootDirectories,
    directories: generated.directories.map((directory) => directory.path),
    routes: generated.routes,
    componentDescriptors: generated.componentDescriptors,
    files: generated.files.map((file) => ({
      path: file.path,
      kind: file.kind,
      metadata: file.metadata,
      contentLength: file.content.length,
      content: file.content,
    })),
  };
}

export function serializeGeneratedProjectTreeJson(
  generated: GeneratedNextJsProject,
  options?: { includeGeneratedAt?: boolean; pretty?: boolean },
): string {
  const tree = serializeGeneratedProjectTree(generated, options);
  const pretty = options?.pretty ?? true;
  return pretty ? JSON.stringify(tree, null, 2) : JSON.stringify(tree);
}

export function stableSerializeGeneratedProjectTreeJson(
  generated: GeneratedNextJsProject,
): string {
  const tree = serializeGeneratedProjectTree(generated, { includeGeneratedAt: false });
  return stableStringify(tree);
}
