#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

npx tsx -e "import { writeFileSync } from 'node:fs'; import { join } from 'node:path'; import { generateSmashburgerZipExportSample } from './lib/project-export/zip-export.verify.ts'; (async () => { const { zipExport } = await generateSmashburgerZipExportSample(); const outputPath = join(process.cwd(), zipExport.suggestedFilename); writeFileSync(outputPath, zipExport.archive); console.log(outputPath); })().catch((error) => { console.error(error); process.exit(1); });"
