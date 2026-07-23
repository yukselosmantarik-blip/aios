import type { ExportableWebsiteProject, NormalizedExportFile, ZipReadyEntry } from "@/lib/project-export/types";

// yazl clamps mtimes before 1980-01-01 (local) to its DOS minimum.
export const DETERMINISTIC_ZIP_MTIME = new Date(1980, 0, 1);

export const REQUIRED_ZIP_ROOT_FILES = [
  "export-manifest.json",
  "README.md",
  ".env.example",
] as const;

const EXCLUDED_ZIP_PATHS = new Set([".env.local", ".env"]);

const EXCLUDED_ZIP_SUFFIXES = [".local"] as const;

export function shouldExcludeZipPath(path: string): boolean {
  if (EXCLUDED_ZIP_PATHS.has(path)) {
    return true;
  }

  for (const suffix of EXCLUDED_ZIP_SUFFIXES) {
    if (path.endsWith(suffix)) {
      return true;
    }
  }

  if (path.startsWith(".env.") && path !== ".env.example") {
    return true;
  }

  return false;
}

export function resolveZipFileMode(file: NormalizedExportFile | undefined): number {
  if (file?.executable) {
    return 0o100755;
  }

  return 0o100644;
}

export const ZIP_DIRECTORY_MODE = 0o40755;

export function extractUnixModeFromZipAttributes(externalFileAttributes: number): number {
  return (externalFileAttributes >>> 16) & 0xffff;
}

export function filterZipReadyEntries(
  exportPackage: ExportableWebsiteProject,
  detectSecret: (filePath: string, content: string) => number,
): ZipReadyEntry[] {
  const filesByPath = new Map(exportPackage.files.map((file) => [file.path, file]));

  return exportPackage.zipReadyEntries.filter((entry) => {
    if (shouldExcludeZipPath(entry.relativePath)) {
      return false;
    }

    const file = filesByPath.get(entry.relativePath);
    if (file && detectSecret(file.path, file.content) > 0) {
      return false;
    }

    return true;
  });
}

export function collectZipDirectories(
  entries: ZipReadyEntry[],
  directoryPaths: string[],
): string[] {
  const directories = new Set<string>(directoryPaths);

  for (const entry of entries) {
    const parts = entry.relativePath.split("/");
    parts.pop();

    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      directories.add(current);
    }
  }

  return [...directories].sort((left, right) => left.localeCompare(right));
}

export function buildSuggestedZipFilename(projectName: string): string {
  const slug =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "website-export";

  return `${slug}-export.zip`;
}

export function assertRequiredZipRootFiles(entries: ZipReadyEntry[]): void {
  for (const requiredPath of REQUIRED_ZIP_ROOT_FILES) {
    if (!entries.some((entry) => entry.relativePath === requiredPath)) {
      throw new Error(`Missing required ZIP entry: ${requiredPath}`);
    }
  }
}
