import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import type {
  RestaurantBusinessProfile,
  RestaurantLandingContent,
} from "@/lib/industries/restaurant/types";

export function isPremiumRestaurantLanding(project: CompiledWebsiteProject): boolean {
  return Boolean(
    project.websiteTheme &&
      project.restaurantAssets &&
      project.restaurantBusinessProfile,
  );
}

export function premiumLandingContent(
  project: CompiledWebsiteProject,
): RestaurantLandingContent | undefined {
  return project.restaurantBusinessProfile?.landing;
}

export function businessProfileForComponentExport(
  profile: RestaurantBusinessProfile,
): Omit<RestaurantBusinessProfile, "landing"> {
  const { landing, ...business } = profile;
  void landing;
  return {
    ...business,
    email: business.email ?? null,
    emailMailtoHref: business.emailMailtoHref ?? null,
    legalLinks: business.legalLinks.map((link) => ({
      label: link.label,
      href: link.href.split("#")[0] || link.href,
    })),
  };
}

export function resolvePremiumOrderCtaHref(project: CompiledWebsiteProject): string {
  const orderFlag = project.featureFlags.find((flag) => flag.name === "onlineOrdering");
  const orderPath =
    orderFlag?.enabled &&
    project.routes.find((route) => /bestell|order|shop/i.test(route.routePath))?.routePath;

  if (orderPath && orderPath.startsWith("http")) {
    return orderPath;
  }

  return project.restaurantBusinessProfile?.phoneTelHref ?? "#menu";
}

export function premiumSectionAnchor(href: string): string {
  if (href.startsWith("#")) {
    return `/${href}`;
  }
  return href;
}
