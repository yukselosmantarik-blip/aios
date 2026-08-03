import { createClient } from "@/lib/supabase/server";

const BUCKET_ID = "website-brief-logos";
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

export function buildWebsiteBriefLogoObjectPath(
  userId: string,
  briefId: string,
  fileName: string,
): string {
  return `${userId}/${briefId}/${sanitizeFileName(fileName)}`;
}

export async function uploadWebsiteBriefLogo(
  userId: string,
  briefId: string,
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

  const supabase = await createClient();
  const objectPath = buildWebsiteBriefLogoObjectPath(
    userId,
    briefId,
    file.name || "logo",
  );

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET_ID)
    .upload(objectPath, buffer, {
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

export async function removeWebsiteBriefLogo(
  objectPath: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET_ID).remove([objectPath]);
}
