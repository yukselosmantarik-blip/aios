import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";

export const GENERATOR_VERSION = "8.2.0";

export type ProjectGeneratorInput = {
  project: CompiledWebsiteProject;
  generatedAt?: string;
};

export type VirtualFileKind =
  | "config"
  | "route-shell"
  | "layout-shell"
  | "component-descriptor"
  | "registry"
  | "asset-placeholder"
  | "content"
  | "types"
  | "styles"
  | "documentation";

export type VirtualFileMetadata = {
  description: string;
  routePath?: string;
  pageId?: string;
  pageRole?: string;
  componentName?: string;
  assetRole?: string;
  isPlaceholder?: boolean;
  implementationStatus: "metadata-only" | "placeholder" | "descriptor";
};

export type VirtualFile = {
  path: string;
  kind: VirtualFileKind;
  content: string;
  metadata: VirtualFileMetadata;
};

export type VirtualDirectory = {
  path: string;
};

export type GeneratedRouteDescriptor = {
  id: string;
  pageName: string;
  routePath: string;
  appSegment: string;
  pageFilePath: string;
  pageRole: string;
  isIndexable: boolean;
  seoTitle: string;
};

export type ComponentDescriptor = {
  id: string;
  name: string;
  filePath: string;
  category: string;
  purpose: string;
  propsSchema: Record<string, string>;
  variants: string[];
  pageUsage: string[];
  sourceComponentId: string;
  implementationStatus: "descriptor-only";
};

export type GeneratedNextJsProject = {
  generatorVersion: string;
  sourceProjectId: string;
  sourceProjectName: string;
  generatedAt: string;
  targetFramework: "nextjs-app-router";
  rootDirectories: string[];
  directories: VirtualDirectory[];
  files: VirtualFile[];
  routes: GeneratedRouteDescriptor[];
  componentDescriptors: ComponentDescriptor[];
  requiredFolders: string[];
};

export type ProjectGeneratorResult = {
  generated: GeneratedNextJsProject;
};

export type SerializedProjectTree = {
  generatorVersion: string;
  sourceProjectId: string;
  sourceProjectName: string;
  generatedAt: string;
  summary: {
    fileCount: number;
    folderCount: number;
    routeCount: number;
    componentDescriptorCount: number;
  };
  rootDirectories: string[];
  directories: string[];
  routes: GeneratedRouteDescriptor[];
  componentDescriptors: ComponentDescriptor[];
  files: Array<{
    path: string;
    kind: VirtualFileKind;
    metadata: VirtualFileMetadata;
    contentLength: number;
    content: string;
  }>;
};

export type GeneratorVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type GeneratorVerificationResult = {
  passed: boolean;
  checks: GeneratorVerificationCheck[];
};

export type GeneratorSampleReport = {
  filesPrepared: number;
  foldersPrepared: number;
  routesPrepared: string[];
  componentDescriptors: string[];
  verificationPassed: boolean;
  failedChecks: GeneratorVerificationCheck[];
  identicalRuns: boolean;
};
