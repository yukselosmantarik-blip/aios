export type {
  IndustryId,
  IndustryRegistration,
  IndustryRegistrySnapshot,
} from "@/lib/core/registries/types";

export {
  ensureIndustryRegistryBootstrapped,
  registerIndustry,
  getIndustryRegistration,
  listIndustryRegistrations,
  getIndustryRegistrySnapshot,
  isIndustryRegistered,
  resolveIndustryIdFromBrief,
  resolveIndustryRegistrationFromBrief,
  resetIndustryRegistryForTests,
} from "@/lib/core/registries/industry-registry";

export { BUILTIN_INDUSTRY_DEFINITIONS } from "@/lib/core/registries/industry-definitions";

export {
  verifyIndustryRegistry,
  type IndustryRegistryVerificationCheck,
  type IndustryRegistryVerificationResult,
} from "@/lib/core/registries/verify";
