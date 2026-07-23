import { createHash } from "node:crypto";

import { stableStringify } from "@/lib/website-compiler/normalize";
import type { ExportChecksumAlgorithm, NormalizedExportFile } from "@/lib/project-export/types";
import { EXPORT_MANIFEST_PATH } from "@/lib/project-export/types";

export const CHECKSUM_ALGORITHM: ExportChecksumAlgorithm = "sha256";

export function computeContentChecksum(content: string): string {
  return createHash(CHECKSUM_ALGORITHM).update(content).digest("hex");
}

export function computeBufferChecksum(buffer: Buffer): string {
  return createHash(CHECKSUM_ALGORITHM).update(buffer).digest("hex");
}

export function computeTreeChecksum(files: NormalizedExportFile[]): string {
  const payload = files
    .filter((file) => file.path !== EXPORT_MANIFEST_PATH)
    .slice()
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((file) => `${file.path}\n${file.checksum}`)
    .join("\n---\n");

  return computeContentChecksum(payload);
}

export function stableSerializeNormalizedFiles(files: NormalizedExportFile[]): string {
  return stableStringify(
    files
      .slice()
      .sort((left, right) => left.path.localeCompare(right.path))
      .map((file) => ({
        path: file.path,
        checksum: file.checksum,
        byteLength: file.byteLength,
      })),
  );
}
