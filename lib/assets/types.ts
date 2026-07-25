/**
 * Typed public paths for restaurant website media (Next.js `/public` root).
 * Paths must start with `/` and are resolved relative to the hosting app's `public/` folder.
 */
export type RestaurantAssets = {
  logo: string;
  hero: string;
  gallery: string[];
  menu?: string;
  business?: string;
};

export type RestaurantProjectKey = "by-nanis";
