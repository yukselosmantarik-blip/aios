import type { VirtualDirectory, VirtualFile } from "@/lib/project-generator/types";

export const REQUIRED_ROOT_DIRECTORIES = [
  "app",
  "components",
  "lib",
  "styles",
  "public",
  "content",
  "types",
] as const;

export function normalizeProjectPath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\\/g, "/");
}

export function joinProjectPath(...segments: string[]): string {
  return normalizeProjectPath(
    segments
      .filter(Boolean)
      .join("/")
      .replace(/\/+/g, "/"),
  );
}

export function directoryPathFromFilePath(filePath: string): string {
  const normalized = normalizeProjectPath(filePath);
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash === -1) {
    return "";
  }
  return normalized.slice(0, lastSlash);
}

export function fileNameFromPath(filePath: string): string {
  const normalized = normalizeProjectPath(filePath);
  const lastSlash = normalized.lastIndexOf("/");
  return lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);
}

export function routePathToAppSegment(routePath: string): string {
  if (routePath === "/") {
    return "";
  }
  return routePath.replace(/^\/+/, "");
}

export function routePathToPageFilePath(routePath: string): string {
  const segment = routePathToAppSegment(routePath);
  if (!segment) {
    return "app/page.tsx";
  }
  return joinProjectPath("app", segment, "page.tsx");
}

export function collectDirectoriesFromFiles(files: VirtualFile[]): VirtualDirectory[] {
  const directorySet = new Set<string>([...REQUIRED_ROOT_DIRECTORIES]);

  for (const file of files) {
    let current = directoryPathFromFilePath(file.path);
    while (current) {
      directorySet.add(current);
      current = directoryPathFromFilePath(current);
    }
  }

  return [...directorySet]
    .sort((left, right) => left.localeCompare(right))
    .map((path) => ({ path }));
}

export function sortVirtualFiles(files: VirtualFile[]): VirtualFile[] {
  return [...files].sort((left, right) => left.path.localeCompare(right.path));
}

export function assertUniqueFilePaths(files: VirtualFile[]): void {
  const seen = new Set<string>();
  for (const file of files) {
    if (seen.has(file.path)) {
      throw new Error(`Duplicate virtual file path: ${file.path}`);
    }
    seen.add(file.path);
  }
}

export function groupFilesByDirectory(files: VirtualFile[]): Map<string, VirtualFile[]> {
  const groups = new Map<string, VirtualFile[]>();
  for (const file of files) {
    const directory = directoryPathFromFilePath(file.path) || ".";
    const current = groups.get(directory) ?? [];
    current.push(file);
    groups.set(directory, current);
  }
  return groups;
}

export function buildVirtualFile(
  path: string,
  kind: VirtualFile["kind"],
  content: string,
  metadata: VirtualFile["metadata"],
): VirtualFile {
  return {
    path: normalizeProjectPath(path),
    kind,
    content,
    metadata,
  };
}
