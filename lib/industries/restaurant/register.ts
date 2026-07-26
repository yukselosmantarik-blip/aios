import { registerIndustryModule } from "@/lib/core/registries/industry-module-registry";
import { resolveRestaurantCompileAttachments } from "@/lib/industries/restaurant/resolve-compile";

let registered = false;

/** Registers the restaurant industry module with the AIOS Industry Module Registry. */
export function registerRestaurantIndustryModule(): void {
  if (registered) {
    return;
  }

  registerIndustryModule({
    id: "restaurant",
    compile: {
      resolveCompileAttachments: resolveRestaurantCompileAttachments,
    },
  });

  registered = true;
}

/** @internal */
export function resetRestaurantIndustryModuleRegistrationForTests(): void {
  registered = false;
}
