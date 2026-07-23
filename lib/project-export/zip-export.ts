import { ZipFile } from "yazl";

import { computeBufferChecksum } from "@/lib/project-export/checksum";
import { detectSecrets } from "@/lib/project-export/normalize";
import type { ExportableWebsiteProject, ZipExportResult, ZipReadyEntry } from "@/lib/project-export/types";
import { ZIP_EXPORT_VERSION } from "@/lib/project-export/types";
import {
  DETERMINISTIC_ZIP_MTIME,
  ZIP_DIRECTORY_MODE,
  assertRequiredZipRootFiles,
  buildSuggestedZipFilename,
  collectZipDirectories,
  filterZipReadyEntries,
  resolveZipFileMode,
} from "@/lib/project-export/zip-utils";
import { verifyZipArchive } from "@/lib/project-export/zip-verify";

export type CreateZipExportOptions = {
  generationTime?: string;
  skipVerification?: boolean;
};

function bufferFromZipEntry(entry: ZipReadyEntry): Buffer {
  const buffer = Buffer.from(entry.content, "utf-8");
  if (buffer.length !== entry.byteLength) {
    throw new Error(`UTF-8 byte length mismatch for ${entry.relativePath}`);
  }

  return buffer;
}

function finalizeZipFile(zipFile: ZipFile): Promise<Buffer> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    zipFile.outputStream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    zipFile.outputStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    zipFile.on("error", reject);
    zipFile.end();
  });
}

function writeDeterministicZipArchive(input: {
  directories: string[];
  entries: ZipReadyEntry[];
  filesByPath: Map<string, ExportableWebsiteProject["files"][number]>;
}): Promise<Buffer> {
  const zipFile = new ZipFile();

  for (const directory of input.directories) {
    zipFile.addEmptyDirectory(`${directory}/`, {
      mtime: DETERMINISTIC_ZIP_MTIME,
      mode: ZIP_DIRECTORY_MODE,
      forceDosTimestamp: true,
    });
  }

  for (const entry of input.entries) {
    const file = input.filesByPath.get(entry.relativePath);
    zipFile.addBuffer(bufferFromZipEntry(entry), entry.relativePath, {
      mtime: DETERMINISTIC_ZIP_MTIME,
      mode: resolveZipFileMode(file),
      compress: false,
      forceDosTimestamp: true,
    });
  }

  return finalizeZipFile(zipFile);
}

export async function createZipExport(
  exportPackage: ExportableWebsiteProject,
  options: CreateZipExportOptions = {},
): Promise<ZipExportResult> {
  const generationTime = options.generationTime ?? new Date().toISOString();
  const entries = filterZipReadyEntries(exportPackage, detectSecrets).slice().sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath),
  );

  assertRequiredZipRootFiles(entries);

  const directories = collectZipDirectories(
    entries,
    exportPackage.directories.map((directory) => directory.path),
  );
  const filesByPath = new Map(exportPackage.files.map((file) => [file.path, file]));
  const archive = await writeDeterministicZipArchive({
    directories,
    entries,
    filesByPath,
  });

  const metadata = {
    archiveSize: archive.length,
    fileCount: entries.length,
    directoryCount: directories.length,
    checksum: computeBufferChecksum(archive),
    generationTime,
  };

  if (!options.skipVerification) {
    const verification = await verifyZipArchive({
      archive,
      exportPackage,
      entries,
      expectedMetadata: metadata,
    });

    if (!verification.passed) {
      const failed = verification.checks.filter((check) => !check.passed);
      throw new Error(
        `ZIP verification failed: ${failed.map((check) => check.name).join(", ")}`,
      );
    }
  }

  return {
    exportVersion: ZIP_EXPORT_VERSION,
    archive,
    metadata,
    suggestedFilename: buildSuggestedZipFilename(exportPackage.projectMetadata.projectName),
    mimeType: "application/zip",
    verified: !options.skipVerification,
  };
}
