import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";

import * as yauzl from "yauzl";

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

export async function extractZipArchiveToDirectory(
  archive: Buffer,
  targetDirectory: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      archive,
      { lazyEntries: true, decodeStrings: true, validateEntrySizes: true },
      (openError, zipfile) => {
        if (openError || !zipfile) {
          reject(openError ?? new Error("Failed to open ZIP archive"));
          return;
        }

        zipfile.on("entry", (entry) => {
          const outputPath = join(targetDirectory, entry.fileName);
          if (/\/$/.test(entry.fileName)) {
            mkdirSync(outputPath, { recursive: true });
            zipfile.readEntry();
            return;
          }

          mkdirSync(dirname(outputPath), { recursive: true });

          zipfile.openReadStream(entry, (streamError, readStream) => {
            if (streamError || !readStream) {
              zipfile.close();
              reject(streamError ?? new Error(`Missing read stream for ${entry.fileName}`));
              return;
            }

            readStreamToBuffer(readStream)
              .then((content) => {
                writeFileSync(outputPath, content);
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
          resolve();
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

export function createTempExportDirectory(prefix = "aios-export-verify-"): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function removeTempExportDirectory(directory: string): void {
  rmSync(directory, { recursive: true, force: true });
}
