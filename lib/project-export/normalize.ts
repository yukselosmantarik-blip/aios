import { fileNameFromPath } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import { computeBufferChecksum, computeContentChecksum } from "@/lib/project-export/checksum";
import type {
  ExportFileCategory,
  NormalizedExportDirectory,
  NormalizedExportFile,
  PlaceholderCategory,
} from "@/lib/project-export/types";
import { EXPORT_MANIFEST_PATH, EXPORT_PLACEHOLDER_REPORT_PATH } from "@/lib/project-export/types";

export const REQUIRED_ROOT_FILES = [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "tailwind.config.ts",
  "postcss.config.js",
  "eslint.config.js",
  "README.md",
  ".gitignore",
  ".env.example",
  "export-manifest.json",
] as const;

export const EXPECTED_DIRECTORY_PREFIXES = [
  "app",
  "components",
  "content",
  "lib",
  "public",
  "public/images",
  "public/icons",
  "public/fonts",
  "styles",
  "types",
] as const;

const SECRET_CONTENT_PATTERNS = [
  /sk-[A-Za-z0-9]{10,}/,
  /OPENAI_API_KEY\s*=\s*\S+/i,
  /ANTHROPIC_API_KEY\s*=\s*\S+/i,
  /SUPABASE_SERVICE_ROLE\s*=\s*\S+/i,
  /password\s*=\s*['"][^'"]{3,}['"]/i,
  /access[_-]?token\s*=\s*['"][^'"]{3,}['"]/i,
] as const;

const ABSOLUTE_PATH_PATTERNS = [
  /^\/Users\//,
  /^\/home\//,
  /^[A-Za-z]:\\/,
  /\.\.\//,
] as const;

export function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function isSafeRelativePath(path: string): boolean {
  if (!path || path.startsWith("/") || path.includes("\\")) {
    return false;
  }
  if (path.includes("..")) {
    return false;
  }
  return true;
}

export function categorizeExportPath(path: string, kind: VirtualFile["kind"]): ExportFileCategory {
  if (path.startsWith("app/")) {
    return "app";
  }
  if (path.startsWith("components/")) {
    return "component";
  }
  if (path.startsWith("content/")) {
    return "content";
  }
  if (path.startsWith("lib/")) {
    return "lib";
  }
  if (path.startsWith("public/")) {
    return "asset";
  }
  if (path.startsWith("styles/")) {
    return "style";
  }
  if (path.startsWith("types/")) {
    return "type";
  }
  if (path === "README.md" || path.endsWith("-report.json") || kind === "documentation") {
    return "documentation";
  }
  if (path.endsWith(".json") || path.endsWith(".ts") || path.endsWith(".js") || path.startsWith(".")) {
    return "config";
  }
  if (path === "export-manifest.json") {
    return "manifest";
  }
  return "other";
}

export function fileExtension(path: string): string {
  const fileName = fileNameFromPath(path);
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0) {
    return "";
  }
  return fileName.slice(dotIndex + 1);
}

export function isRequiredExportFile(path: string): boolean {
  return (REQUIRED_ROOT_FILES as readonly string[]).includes(path);
}

export function isGeneratedExportFile(file: VirtualFile): boolean {
  return file.metadata.implementationStatus === "generated";
}

export function isPlaceholderExportFile(file: VirtualFile): boolean {
  if (file.metadata.isPlaceholder) {
    return true;
  }
  return file.content.includes("[PLACEHOLDER:") || file.content.includes("ASSET_METADATA:");
}

export function shouldReplaceBeforeProduction(file: VirtualFile): boolean {
  if (file.metadata.isPlaceholder) {
    return true;
  }
  if (file.path.startsWith("public/")) {
    return true;
  }
  return /launchBlocking|replaceBeforeProduction|PLACEHOLDER:/i.test(file.content);
}

export function normalizeExportFile(file: VirtualFile): NormalizedExportFile {
  const path = file.path.replace(/^\/+/, "");
  const isBase64 = file.contentEncoding === "base64";
  const content = isBase64 ? file.content : normalizeLineEndings(file.content);
  const byteLength = isBase64
    ? Buffer.from(content, "base64").length
    : Buffer.byteLength(content, "utf8");
  const checksum = isBase64
    ? computeBufferChecksum(Buffer.from(content, "base64"))
    : computeContentChecksum(content);

  return {
    path,
    fileName: fileNameFromPath(path),
    extension: fileExtension(path),
    category: categorizeExportPath(path, file.kind),
    encoding: isBase64 ? "base64" : "utf-8",
    content,
    byteLength,
    checksum,
    executable: path.endsWith(".sh"),
    required: isRequiredExportFile(path),
    generated: isGeneratedExportFile(file),
    placeholder: isPlaceholderExportFile(file),
    replaceBeforeProduction: shouldReplaceBeforeProduction(file),
  };
}

export function normalizeExportFiles(files: VirtualFile[]): NormalizedExportFile[] {
  return files
    .map((file) => normalizeExportFile(file))
    .sort((left, right) => left.path.localeCompare(right.path));
}

export function normalizeExportDirectories(files: NormalizedExportFile[]): NormalizedExportDirectory[] {
  const directories = new Set<string>();

  for (const file of files) {
    const parts = file.path.split("/");
    parts.pop();
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      directories.add(current);
    }
  }

  return [...directories]
    .sort((left, right) => left.localeCompare(right))
    .map((path) => ({
      path,
      category: path.includes("/") ? categorizeExportPath(`${path}/.keep`, "config") : "root",
      required: (EXPECTED_DIRECTORY_PREFIXES as readonly string[]).includes(path),
    }));
}

export function detectSecrets(filePath: string, content: string): number {
  if (filePath === ".env.local") {
    return 1;
  }

  if (
    filePath === ".gitignore" ||
    filePath === "README.md" ||
    filePath === ".env.example" ||
    filePath === EXPORT_PLACEHOLDER_REPORT_PATH ||
    filePath === EXPORT_MANIFEST_PATH
  ) {
    return 0;
  }

  return SECRET_CONTENT_PATTERNS.reduce(
    (count, pattern) => count + (pattern.test(content) ? 1 : 0),
    0,
  );
}

export function detectAbsoluteLocalPaths(content: string): number {
  return ABSOLUTE_PATH_PATTERNS.reduce(
    (count, pattern) => count + (pattern.test(content) ? 1 : 0),
    0,
  );
}

export function classifyPlaceholderCategory(label: string): PlaceholderCategory {
  const lower = label.toLowerCase();
  if (/logo/.test(lower)) return "logo";
  if (/bild|image|media|hero|produkt|gallery/.test(lower)) return "image";
  if (/price|eur|€/.test(lower)) return "price";
  if (/adresse|address/.test(lower)) return "address";
  if (/telefon|phone/.test(lower)) return "phone";
  if (/e-mail|email/.test(lower)) return "email";
  if (/öffnungs|opening/.test(lower)) return "opening-hours";
  if (/testimonial|quote/.test(lower)) return "testimonial";
  if (/legal|privacy|impressum|datenschutz/.test(lower)) return "legal";
  if (/map/.test(lower)) return "map";
  if (/social/.test(lower)) return "social-link";
  if (/product|menu|allergen|availability|domain/.test(lower)) return "product-data";
  if (/domain|url|website/.test(lower)) return "domain";
  return "other";
}

export function mergeVirtualFiles(base: VirtualFile[], overlay: VirtualFile[]): VirtualFile[] {
  const merged = new Map(base.map((file) => [file.path, file]));
  for (const file of overlay) {
    merged.set(file.path, file);
  }
  return [...merged.values()].sort((left, right) => left.path.localeCompare(right.path));
}

export function extractMetadataField(content: string, field: string): string {
  const match = content.match(new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`));
  return match?.[1] ?? "unknown";
}
