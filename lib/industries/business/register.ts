import { registerIndustryModule } from "@/lib/core/registries/industry-module-registry";
import { resolveBusinessCompileAttachments } from "@/lib/industries/business/resolve-compile";

let registered = false;

export function registerBusinessIndustryModule(): void {
  if (registered) {
    return;
  }

  registerIndustryModule({
    id: "business",
    compile: {
      resolveCompileAttachments: resolveBusinessCompileAttachments,
    },
  });

  registered = true;
}

export function resetBusinessIndustryModuleRegistrationForTests(): void {
  registered = false;
}
