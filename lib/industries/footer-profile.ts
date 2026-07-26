import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { businessProfileToFooterProfile } from "@/lib/industries/business/footer-adapter";
import {
  resolveFooterBusinessProfile as resolveRestaurantFooterBusinessProfile,
  synthesizeRestaurantBusinessProfile,
} from "@/lib/industries/restaurant/business-profile";

export function resolveFooterBusinessProfile(project: CompiledWebsiteProject) {
  if (project.businessProfile) {
    return businessProfileToFooterProfile(project.businessProfile);
  }
  return resolveRestaurantFooterBusinessProfile(project);
}

export { synthesizeRestaurantBusinessProfile };
