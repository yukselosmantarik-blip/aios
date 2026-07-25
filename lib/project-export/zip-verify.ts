import { crc32 } from "node:zlib";
import { Readable } from "node:stream";

import * as yauzl from "yauzl";

import { computeBufferChecksum, computeContentChecksum } from "@/lib/project-export/checksum";
import { detectSecrets } from "@/lib/project-export/normalize";
import type {
  ExportableWebsiteProject,
  ZipExportMetadata,
  ZipExportVerificationCheck,
  ZipExportVerificationReport,
  ZipReadyEntry,
} from "@/lib/project-export/types";
import {
  DETERMINISTIC_ZIP_MTIME,
  REQUIRED_ZIP_ROOT_FILES,
  ZIP_DIRECTORY_MODE,
  extractUnixModeFromZipAttributes,
  filterZipReadyEntries,
  resolveZipFileMode,
  shouldExcludeZipPath,
} from "@/lib/project-export/zip-utils";

type ArchiveContents = {
  entries: Array<{
    fileName: string;
    isDirectory: boolean;
    compressionMethod: number;
    uncompressedSize: number;
    externalFileAttributes: number;
    lastModDate: Date;
    crc32: number;
    content: Buffer;
  }>;
};

function readStreamToBuffer(readStream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readStream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    readStream.on("end", () => resolve(Buffer.concat(chunks)));
    readStream.on("error", reject);
  });
}

function readArchiveContents(buffer: Buffer): Promise<ArchiveContents> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      buffer,
      {
        lazyEntries: true,
        decodeStrings: true,
        validateEntrySizes: true,
      },
      (openError, zipfile) => {
        if (openError || !zipfile) {
          reject(openError ?? new Error("Failed to open ZIP archive"));
          return;
        }

        const entries: ArchiveContents["entries"] = [];

        zipfile.on("entry", (entry) => {
          const isDirectory = /\/$/.test(entry.fileName);

          if (isDirectory) {
            entries.push({
              fileName: entry.fileName,
              isDirectory: true,
              compressionMethod: entry.compressionMethod,
              uncompressedSize: entry.uncompressedSize,
              externalFileAttributes: entry.externalFileAttributes,
              lastModDate: entry.getLastModDate({ forceDosFormat: true }),
              crc32: entry.crc32,
              content: Buffer.alloc(0),
            });
            zipfile.readEntry();
            return;
          }

          zipfile.openReadStream(entry, (streamError, readStream) => {
            if (streamError || !readStream) {
              zipfile.close();
              reject(streamError ?? new Error(`Missing read stream for ${entry.fileName}`));
              return;
            }

            readStreamToBuffer(readStream)
              .then((content) => {
                entries.push({
                  fileName: entry.fileName,
                  isDirectory: false,
                  compressionMethod: entry.compressionMethod,
                  uncompressedSize: entry.uncompressedSize,
                  externalFileAttributes: entry.externalFileAttributes,
                  lastModDate: entry.getLastModDate({ forceDosFormat: true }),
                  crc32: entry.crc32,
                  content,
                });
                zipfile.readEntry();
              })
              .catch((readError) => {
                zipfile.close();
                reject(readError);
              });
          });
        });

        zipfile.on("end", () => {
          zipfile.close();
          resolve({ entries });
        });

        zipfile.on("error", (zipError) => {
          zipfile.close();
          reject(zipError);
        });

        zipfile.readEntry();
      },
    );
  });
}

export async function verifyZipArchive(input: {
  archive: Buffer;
  exportPackage: ExportableWebsiteProject;
  entries: ZipReadyEntry[];
  expectedMetadata?: ZipExportMetadata;
}): Promise<ZipExportVerificationReport> {
  const checks: ZipExportVerificationCheck[] = [];
  const checksumLookup = new Map(input.entries.map((entry) => [entry.relativePath, entry.checksum]));
  const fileLookup = new Map(input.exportPackage.files.map((file) => [file.path, file]));
  const expectedFiles = new Set(input.entries.map((entry) => entry.relativePath));

  let archiveContents: ArchiveContents;
  try {
    archiveContents = await readArchiveContents(input.archive);
    checks.push({
      name: "Archive opens successfully",
      passed: true,
      detail: `${input.archive.length} bytes`,
    });
  } catch (error) {
    checks.push({
      name: "Archive opens successfully",
      passed: false,
      detail: error instanceof Error ? error.message : "Unknown open error",
    });

    return {
      passed: false,
      metadata: {
        archiveSize: input.archive.length,
        fileCount: input.entries.length,
        directoryCount: 0,
        checksum: computeBufferChecksum(input.archive),
        generationTime: input.expectedMetadata?.generationTime ?? "unknown",
      },
      checks,
      deterministicChecksumMatch: false,
    };
  }

  const archiveFiles = archiveContents.entries.filter((entry) => !entry.isDirectory);
  const archiveDirectories = archiveContents.entries.filter((entry) => entry.isDirectory);

  checks.push({
    name: "Archive entry count matches export plan",
    passed: archiveFiles.length === input.entries.length,
    detail: `${archiveFiles.length} files, ${archiveDirectories.length} directories`,
  });

  checks.push({
    name: "Required root files present",
    passed: REQUIRED_ZIP_ROOT_FILES.every((path) => expectedFiles.has(path)),
    detail: REQUIRED_ZIP_ROOT_FILES.join(", "),
  });

  checks.push({
    name: "Excluded secret paths absent",
    passed: archiveContents.entries.every(
      (entry) => !shouldExcludeZipPath(entry.fileName.replace(/\/$/, "")),
    ),
    detail: "No .env.local or secret env files",
  });

  const unexpectedFiles = archiveFiles.filter((entry) => !expectedFiles.has(entry.fileName));
  checks.push({
    name: "No unexpected files in archive",
    passed: unexpectedFiles.length === 0,
    detail: unexpectedFiles.map((entry) => entry.fileName).join(", ") || "All files expected",
  });

  const missingFiles = [...expectedFiles].filter(
    (path) => !archiveFiles.some((entry) => entry.fileName === path),
  );
  checks.push({
    name: "All planned files present",
    passed: missingFiles.length === 0,
    detail: missingFiles.join(", ") || `${expectedFiles.size} files`,
  });

  const nonStoredFiles = archiveFiles.filter((entry) => entry.compressionMethod !== 0);
  checks.push({
    name: "Files use deterministic stored compression",
    passed: nonStoredFiles.length === 0,
    detail: `${nonStoredFiles.length} compressed entries`,
  });

  const invalidDirectoryModes = archiveDirectories.filter(
    (entry) => extractUnixModeFromZipAttributes(entry.externalFileAttributes) !== ZIP_DIRECTORY_MODE,
  );
  checks.push({
    name: "Directory permissions preserved",
    passed: invalidDirectoryModes.length === 0,
    detail: `mode ${ZIP_DIRECTORY_MODE.toString(8)}`,
  });

  const deterministicTimestamp = DETERMINISTIC_ZIP_MTIME.getTime();
  const invalidTimestamps = archiveContents.entries.filter(
    (entry) => entry.lastModDate.getTime() !== deterministicTimestamp,
  );
  checks.push({
    name: "Deterministic timestamps preserved",
    passed: invalidTimestamps.length === 0,
    detail: DETERMINISTIC_ZIP_MTIME.toISOString(),
  });

  const permissionMismatches = archiveFiles.filter((entry) => {
    const file = fileLookup.get(entry.fileName);
    return extractUnixModeFromZipAttributes(entry.externalFileAttributes) !== resolveZipFileMode(file);
  });
  checks.push({
    name: "File permissions preserved",
    passed: permissionMismatches.length === 0,
    detail: `${permissionMismatches.length} mismatches`,
  });

  let utf8Failures = 0;
  let crcFailures = 0;
  let checksumFailures = 0;
  const encodingLookup = new Map(input.entries.map((entry) => [entry.relativePath, entry.encoding]));

  for (const entry of archiveFiles) {
    const encoding = encodingLookup.get(entry.fileName) ?? "utf-8";

    if (encoding === "base64") {
      const expectedChecksum = checksumLookup.get(entry.fileName);
      const actualChecksum = computeBufferChecksum(entry.content);
      if (!expectedChecksum || actualChecksum !== expectedChecksum) {
        checksumFailures += 1;
      }

      const actualCrc = crc32(entry.content) >>> 0;
      if (actualCrc !== (entry.crc32 >>> 0)) {
        crcFailures += 1;
      }
      continue;
    }

    const utf8Content = entry.content.toString("utf-8");
    const roundTrip = Buffer.from(utf8Content, "utf-8");
    if (!roundTrip.equals(entry.content)) {
      utf8Failures += 1;
    }

    const actualCrc = crc32(entry.content) >>> 0;
    if (actualCrc !== (entry.crc32 >>> 0)) {
      crcFailures += 1;
    }

    const expectedChecksum = checksumLookup.get(entry.fileName);
    const actualChecksum = computeContentChecksum(utf8Content);
    if (!expectedChecksum || actualChecksum !== expectedChecksum) {
      checksumFailures += 1;
    }
  }

  checks.push({
    name: "UTF-8 encoding preserved",
    passed: utf8Failures === 0,
    detail: `${utf8Failures} invalid UTF-8 files`,
  });

  checks.push({
    name: "ZIP CRC32 integrity verified",
    passed: crcFailures === 0,
    detail: `${crcFailures} CRC mismatches`,
  });

  checks.push({
    name: "Exported file checksums verified",
    passed: checksumFailures === 0,
    detail: `${checksumFailures} checksum mismatches`,
  });

  const metadata: ZipExportMetadata = {
    archiveSize: input.archive.length,
    fileCount: archiveFiles.length,
    directoryCount: archiveDirectories.length,
    checksum: computeBufferChecksum(input.archive),
    generationTime: input.expectedMetadata?.generationTime ?? "unknown",
  };

  if (input.expectedMetadata) {
    checks.push({
      name: "Archive metadata size matches",
      passed: metadata.archiveSize === input.expectedMetadata.archiveSize,
      detail: `${metadata.archiveSize} bytes`,
    });
    checks.push({
      name: "Archive metadata checksum matches",
      passed: metadata.checksum === input.expectedMetadata.checksum,
      detail: metadata.checksum,
    });
  }

  return {
    passed: checks.every((check) => check.passed),
    metadata,
    checks,
    deterministicChecksumMatch: false,
  };
}

export async function verifyDeterministicZipExport(
  exportPackage: ExportableWebsiteProject,
  createZip: (exportPackage: ExportableWebsiteProject, generationTime: string) => Promise<{ archive: Buffer; metadata: ZipExportMetadata }>,
): Promise<ZipExportVerificationReport> {
  const entries = filterZipReadyEntries(exportPackage, detectSecrets).sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath),
  );

  const first = await createZip(exportPackage, "1970-01-01T00:00:00.000Z");
  const second = await createZip(exportPackage, "2026-07-22T12:00:00.000Z");

  const verification = await verifyZipArchive({
    archive: first.archive,
    exportPackage,
    entries,
    expectedMetadata: first.metadata,
  });

  const deterministicChecksumMatch =
    first.metadata.checksum === second.metadata.checksum && first.archive.equals(second.archive);

  verification.checks.push({
    name: "Identical input produces identical ZIP checksum",
    passed: deterministicChecksumMatch,
    detail: first.metadata.checksum,
  });

  return {
    ...verification,
    deterministicChecksumMatch,
    passed: verification.passed && deterministicChecksumMatch,
  };
}
