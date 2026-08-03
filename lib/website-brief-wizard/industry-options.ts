import { BUILTIN_INDUSTRY_DEFINITIONS } from "@/lib/core/registries/industry-definitions";

export const WIZARD_INDUSTRY_OPTIONS = BUILTIN_INDUSTRY_DEFINITIONS.map(
  (definition) => ({
    value: definition.label,
    label: definition.label,
    description: definition.metadata?.description ?? "",
  }),
);
