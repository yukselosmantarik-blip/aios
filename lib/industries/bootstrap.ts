import { registerRestaurantIndustryModule } from "@/lib/industries/restaurant/register";
import { registerBusinessIndustryModule } from "@/lib/industries/business/register";

let bootstrapped = false;

/** Registers all industry modules (restaurant first). Safe to call repeatedly. */
export function ensureIndustryModulesRegistered(): void {
  if (bootstrapped) {
    return;
  }

  registerRestaurantIndustryModule();
  registerBusinessIndustryModule();
  bootstrapped = true;
}

/** @internal */
export function resetIndustryModulesBootstrapForTests(): void {
  bootstrapped = false;
}
