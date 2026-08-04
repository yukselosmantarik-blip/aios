import { createClient } from "@/lib/supabase/client";

export const WEBSITE_BRIEF_LOGOS_BUCKET = "website-brief-logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function buildWizardLogoObjectPath(
  userId: string,
  draftId: string,
  fileName: string,
): string {
  return `${userId}/wizard/${draftId}/${sanitizeFileName(fileName)}`;
}

export async function uploadWebsiteBriefLogoFromBrowser(
  userId: string,
  draftId: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "Logo darf maximal 2 MB groß sein." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      error: "Logo muss PNG, JPEG, WebP oder SVG sein.",
    };
  }

  const supabase = createClient();
  const objectPath = buildWizardLogoObjectPath(
    userId,
    draftId,
    file.name || "logo",
  );

  const { error } = await supabase.storage
    .from(WEBSITE_BRIEF_LOGOS_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return {
      error:
        error.message ||
        "Logo konnte nicht hochgeladen werden. Ist der Storage-Bucket konfiguriert?",
    };
  }

  return { path: objectPath };
}
