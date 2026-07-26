import type { RestaurantAssets } from "@/lib/assets/types";
import type { RestaurantBusinessProfile } from "@/lib/business-profiles/types";
import type { WebsiteTheme } from "@/lib/themes/types";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type { WebsiteBlueprintContent } from "@/lib/website-blueprints.types";
import type { PageRole } from "@/lib/website-blueprint-page-dna";
import type { PatternId } from "@/lib/website-blueprint-pattern-library";
import type {
  HierarchyLevel,
  ReadingFlow,
  VisualWeight,
} from "@/lib/website-blueprint-visual-hierarchy";

export const COMPILER_VERSION = "8.1.0";

export type CompilerGenerationMode = "deterministic" | "ai";

export type WebsiteCompilerInput = {
  brief: WebsiteBrief;
  blueprint: WebsiteBlueprintContent;
  sourceBlueprintId?: string;
  sourceBriefId?: string;
  generatedAt?: string;
  generationMode?: CompilerGenerationMode;
  /** Optional customer media paths (AIOS `public/`); not inferred at runtime. */
  restaurantAssets?: RestaurantAssets;
  /** Optional brand theme tokens for generated sites; not inferred at runtime. */
  websiteTheme?: WebsiteTheme;
  /** Optional verified business contact details for generated sites. */
  restaurantBusinessProfile?: RestaurantBusinessProfile;
};

export type DetectedCompilerInputSections = {
  websiteBrief: boolean;
  blueprintContent: boolean;
  pageDna: boolean;
  designSystemDna: boolean;
  componentDna: boolean;
  contentDna: boolean;
  patternLibrary: boolean;
  visualHierarchy: boolean;
  blueprintIntelligence: boolean;
  navigation: boolean;
  seoBasics: boolean;
};

export type ProjectMetadata = {
  projectId: string;
  projectName: string;
  generatedAt: string;
  compilerVersion: string;
  sourceBlueprintId: string;
  sourceBriefId: string;
  generationMode: CompilerGenerationMode;
  targetFramework: "nextjs";
  language: string;
  locale: string;
  status: "compiled";
};

export type BusinessMetadata = {
  businessName: string;
  industry: string;
  location: string | null;
  websiteGoal: string;
  targetAudience: string;
  usp: string | null;
  services: string[];
  profile: "restaurant" | "dentist" | "agency" | "default";
};

export type SiteConfiguration = {
  sitemap: string[];
  primaryCta: string;
  secondaryCta: string;
  styleTier: "premium" | "modern" | "default";
  prefersMotion: boolean;
  referenceWebsites: string[];
};

export type LocaleConfiguration = {
  primaryLanguage: string;
  formalAddress: "Sie";
  numberFormat: "de-DE";
  dateFormat: "DD.MM.YYYY";
  timeFormat: "24h";
  currencyPlaceholder: string;
};

export type ThemeConfiguration = {
  mode: "light";
  primaryColor: string;
  secondaryColor: string;
  styleDescription: string;
};

export type DesignTokenGroup = {
  name: string;
  tokens: Record<string, string | number>;
};

export type DesignTokenModel = {
  colors: DesignTokenGroup;
  typography: DesignTokenGroup;
  spacing: DesignTokenGroup;
  radius: DesignTokenGroup;
  borders: DesignTokenGroup;
  shadows: DesignTokenGroup;
  layoutWidths: DesignTokenGroup;
  breakpoints: DesignTokenGroup;
  transitions: DesignTokenGroup;
  easing: DesignTokenGroup;
  zIndex: DesignTokenGroup;
  mediaRatios: DesignTokenGroup;
};

export type NavigationItem = {
  id: string;
  label: string;
  routeId: string;
  routePath: string;
  order: number;
};

export type NavigationModel = {
  desktopNavigation: NavigationItem[];
  mobileNavigation: NavigationItem[];
  primaryNavigationItems: NavigationItem[];
  ctaItem: NavigationItem;
  activeStateBehavior: string;
  focusBehavior: string;
  mobileOpenCloseBehavior: string;
  stickyBehavior: string;
  scrollBehavior: string;
};

export type FooterModel = {
  variant: "standard";
  navigationGroups: Array<{ title: string; items: NavigationItem[] }>;
  contactPlaceholders: string[];
  legalPlaceholders: string[];
  socialPlaceholders: string[];
  ctaArea: { label: string; routeId: string };
  mobileStackingOrder: string[];
  accessibilityRequirements: string[];
};

export type RouteDefinition = {
  id: string;
  pageName: string;
  slug: string;
  routePath: string;
  pageRole: PageRole;
  isIndexable: boolean;
  canonicalPath: string;
  navigationLabel: string;
  priority: number;
  parentRouteId: string | null;
  childRouteIds: string[];
  internalLinks: string[];
  requiredFeatures: string[];
  missingRequirements: string[];
};

export type ContentBlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "cta"
  | "image"
  | "video"
  | "card-collection"
  | "faq-collection"
  | "testimonial-placeholder"
  | "product-collection"
  | "contact-details"
  | "opening-hours"
  | "social-links"
  | "legal-placeholder"
  | "map-placeholder"
  | "rich-text-placeholder";

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  content: Record<string, string | string[] | boolean | null>;
  source: "brief" | "blueprint" | "derived" | "placeholder";
  isPlaceholder: boolean;
  required: boolean;
  editable: boolean;
  validationRules: string[];
  pageUsage: string[];
};

export type CompiledSection = {
  id: string;
  type: string;
  name: string;
  order: number;
  priority: number;
  hierarchyLevel: HierarchyLevel;
  visualWeight: VisualWeight;
  purpose: string;
  contentBlocks: string[];
  componentReferences: string[];
  ctaReferences: string[];
  mediaReferences: string[];
  responsiveBehavior: string;
  motionBehavior: string;
  accessibilityRequirements: string[];
  requiredData: string[];
  missingData: string[];
  sourcePatternIds: PatternId[];
};

export type CompiledPage = {
  id: string;
  routeId: string;
  pageName: string;
  pageRole: PageRole;
  pageObjective: string;
  userIntent: string;
  primaryCta: string;
  secondaryCta: string;
  hierarchyScore: number;
  readingFlow: ReadingFlow;
  selectedPatternIds: PatternId[];
  componentTree: string[];
  orderedSections: CompiledSection[];
  responsiveRules: string[];
  interactionRules: string[];
  accessibilityRules: string[];
  seo: PageSeoModel;
  contentRequirements: string[];
  mediaRequirements: string[];
  conversionFlow: string[];
  implementationWarnings: string[];
};

export type ComponentCategory =
  | "layout"
  | "hero"
  | "content"
  | "conversion"
  | "media"
  | "form"
  | "navigation"
  | "utility";

export type CompiledComponent = {
  id: string;
  name: string;
  category: ComponentCategory;
  purpose: string;
  propsSchema: Record<string, string>;
  variants: string[];
  states: string[];
  responsiveBehavior: string;
  accessibilityRequirements: string[];
  motionBehavior: string;
  designTokenReferences: string[];
  pageUsage: string[];
  sourcePatternIds: PatternId[];
  missingDataRequirements: string[];
};

export type FormFieldDefinition = {
  id: string;
  name: string;
  type: "text" | "email" | "textarea" | "tel";
  label: string;
  placeholder: string;
  required: boolean;
  validationRules: string[];
  errorMessage: string;
};

export type FormDefinition = {
  id: string;
  name: string;
  purpose: string;
  fields: FormFieldDefinition[];
  requiredFields: string[];
  successMessage: string;
  privacyPlaceholder: string;
  submissionBehaviorPlaceholder: string;
  accessibilityRequirements: string[];
  pageUsage: string[];
};

export type PageSeoModel = {
  title: string;
  titlePattern: string;
  metaDescription: string;
  canonical: string;
  robots: string;
  openGraph: { title: string; description: string; type: string };
  twitter: { card: string; title: string; description: string };
  primaryKeyword: string;
  supportingKeywords: string[];
  h1Direction: string;
  structuredDataType: string;
  breadcrumbRecommendation: string[];
  internalLinks: string[];
  missingSeoInputs: string[];
};

export type StructuredDataRecommendation = {
  id: string;
  type: string;
  pageRouteIds: string[];
  requiredFields: string[];
  missingFields: string[];
};

export type FeatureFlagName =
  | "onlineOrdering"
  | "reservation"
  | "contactForm"
  | "maps"
  | "instagram"
  | "clickToCall"
  | "openingHours"
  | "gallery"
  | "animations"
  | "analytics"
  | "cms"
  | "newsletter"
  | "multilingual"
  | "darkMode";

export type FeatureFlag = {
  name: FeatureFlagName;
  enabled: boolean;
  source: string;
  requiredInputs: string[];
  missingInputs: string[];
  implementationStatus: "ready" | "placeholder" | "blocked";
};

export type MissingDataEntry = {
  id: string;
  category: string;
  field: string;
  affectedPages: string[];
  affectedComponents: string[];
  severity: "critical" | "high" | "medium" | "low";
  placeholder: string;
  recommendation: string;
  blocksGeneration: boolean;
  blocksLaunch: boolean;
};

export type CompilerWarning = {
  code: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  affectedEntity: string;
  recommendedAction: string;
};

export type MediaPlaceholder = {
  id: string;
  role: "hero" | "product" | "gallery" | "logo" | "team" | "decorative";
  aspectRatio: string;
  loadingPriority: "eager" | "lazy";
  altTextRule: string;
  affectedPages: string[];
  isPlaceholder: boolean;
};

export type AccessibilityRequirements = {
  headingOrder: string;
  domOrder: string;
  focusOrder: string;
  skipLinks: string[];
  focusVisibility: string;
  landmarks: string[];
  reducedMotion: string;
};

export type PerformanceRequirements = {
  lcpMediaIds: string[];
  lazyLoadBelowFold: boolean;
  imageOptimization: string;
  motionBudget: string;
};

export type CompiledWebsiteProject = {
  metadata: ProjectMetadata;
  business: BusinessMetadata;
  site: SiteConfiguration;
  locale: LocaleConfiguration;
  theme: ThemeConfiguration;
  designTokens: DesignTokenModel;
  navigation: NavigationModel;
  footer: FooterModel;
  routes: RouteDefinition[];
  pages: CompiledPage[];
  components: CompiledComponent[];
  contentBlocks: ContentBlock[];
  mediaPlaceholders: MediaPlaceholder[];
  forms: FormDefinition[];
  seo: PageSeoModel[];
  structuredData: StructuredDataRecommendation[];
  featureFlags: FeatureFlag[];
  accessibility: AccessibilityRequirements;
  performance: PerformanceRequirements;
  warnings: CompilerWarning[];
  missingData: MissingDataEntry[];
  detectedInputSections: DetectedCompilerInputSections;
  /** Carried from compiler input when provided; used by the project generator. */
  restaurantAssets?: RestaurantAssets;
  /** Carried from compiler input when provided; used by the project generator. */
  websiteTheme?: WebsiteTheme;
  /** Carried from compiler input when provided; used by the project generator. */
  restaurantBusinessProfile?: RestaurantBusinessProfile;
};

export type CompileResult = {
  project: CompiledWebsiteProject;
  warnings: CompilerWarning[];
};
