import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { buildVirtualFile } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import {
  collectRequiredComponents,
  type GeneratedComponentName,
} from "@/lib/project-generator/react-component-utils";

export function buildComponentRegistryFile(required: GeneratedComponentName[]): VirtualFile {
  const exports = required
    .map((name) => `export { ${name} } from './${name}';`)
    .join("\n");

  const content = [
    "/**",
    " * GENERATED COMPONENT REGISTRY — Sprint 8.2C",
    " * Stable export order for page and layout imports.",
    " */",
    "",
    "export type {",
    "  CTA,",
    "  ContentBlockModel,",
    "  ContactDetailsModel,",
    "  FAQItem,",
    "  MediaPlaceholderModel,",
    "  MissingDataReference,",
    "  NavigationItemModel,",
    "  OpeningHoursPlaceholder,",
    "  ProductMenuItemPlaceholder,",
    "  SectionBaseProps,",
    "  SectionComponentProps,",
    "  TestimonialPlaceholder,",
    "} from './types';",
    "",
    exports,
    "",
  ].join("\n");

  return buildVirtualFile("components/generated/index.ts", "react-component", content, {
    description: "Generated component registry exports",
    implementationStatus: "placeholder",
  });
}

export function buildReactComponentRegistry(project: CompiledWebsiteProject): VirtualFile {
  return buildComponentRegistryFile(collectRequiredComponents(project));
}

export function countRegistryExports(content: string): number {
  return (content.match(/^export \{ /gm) ?? []).length;
}

export function findDuplicateExports(content: string): string[] {
  const names = [...content.matchAll(/export \{ (\w+) \}/g)].map((match) => match[1]);
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const name of names) {
    if (seen.has(name)) {
      duplicates.push(name);
    }
    seen.add(name);
  }
  return duplicates;
}
