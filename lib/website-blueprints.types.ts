export type WebsiteBlueprintContent = {
  projectSummary: string;
  targetAudienceSummary: string;
  brandDirection: string;
  recommendedSitemap: string[];
  recommendedPageSections: Record<string, string[]>;
  features: string[];
  contentRequirements: string[];
  seoBasics: string[];
  technicalRecommendation: string;
  implementationChecklist: string[];
  masterPrompt: string;
};

export type WebsiteBlueprint = {
  id: string;
  user_id: string;
  brief_id: string;
  content: WebsiteBlueprintContent;
  generated_at: string;
  created_at: string;
  updated_at: string;
};

export type UpsertWebsiteBlueprintInput = {
  user_id: string;
  brief_id: string;
  content: WebsiteBlueprintContent;
};
