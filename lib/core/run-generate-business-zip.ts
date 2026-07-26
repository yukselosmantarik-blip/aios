import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { compileGenerateAndZipWebsite } from "@/lib/core/pipeline";
import { createSampleBusinessCompilerInput } from "@/lib/core/samples-business";

(async () => {
  const input = createSampleBusinessCompilerInput();
  const { zipExport } = await compileGenerateAndZipWebsite(input, {
    generationTime: "1970-01-01T00:00:00.000Z",
  });
  const outputPath = join(process.cwd(), zipExport.suggestedFilename);
  writeFileSync(outputPath, zipExport.archive);
  console.log(outputPath);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
