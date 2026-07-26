import type { BusinessProfileLink, OpeningHoursLine } from "@/lib/industries/restaurant/types";

export type BusinessServiceItem = {
  id: string;
  title: string;
  description: string;
};

export type BusinessBenefitItem = {
  id: string;
  title: string;
  description: string;
};

export type BusinessTestimonialItem = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

export type BusinessFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type BusinessIndustryProfile = {
  companyName: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  openingHours: OpeningHoursLine[];
  services: BusinessServiceItem[];
  benefits: BusinessBenefitItem[];
  testimonials: BusinessTestimonialItem[];
  faq: BusinessFaqItem[];
  socialLinks: BusinessProfileLink[];
  primaryCta: string;
  legalLinks: BusinessProfileLink[];
};

export const SAMPLE_BUSINESS_BRIEF_ID = "b8e2c4a1-9f3d-4e2a-b1c0-8d7e6f5a4b3c" as const;

export type SampleBusinessBriefId = typeof SAMPLE_BUSINESS_BRIEF_ID;
