import { ensureIndustryModuleRegistryBootstrapped } from "@/lib/core/registries/industry-module-registry";
import { ensureIndustryRegistryBootstrapped } from "@/lib/core/registries/industry-registry";
import { ensureSectionRegistryBootstrapped } from "@/lib/core/registries/section-registry";
import { ensureThemeRegistryBootstrapped } from "@/lib/core/registries/theme-registry";
import { ensureIndustryModulesRegistered } from "@/lib/industries/bootstrap";

let bootstrapped = false;

/**
 * Bootstraps all AIOS Website Generation Engine registries and industry modules.
 * Safe to call repeatedly; required before blueprint, compile, generate, or export.
 */
export function ensureWebsiteEngineBootstrapped(): void {
  if (bootstrapped) {
    return;
  }

  ensureIndustryRegistryBootstrapped();
  ensureSectionRegistryBootstrapped();
  ensureThemeRegistryBootstrapped();
  ensureIndustryModuleRegistryBootstrapped();
  ensureIndustryModulesRegistered();

  bootstrapped = true;
}

/** @internal Test-only reset. */
export function resetWebsiteEngineBootstrapForTests(): void {
  bootstrapped = false;
}
