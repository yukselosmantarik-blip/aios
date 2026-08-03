-- Wizard intake fields for website briefs (contact, social, logo reference)

ALTER TABLE public.website_briefs
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_address text,
  ADD COLUMN IF NOT EXISTS social_media text,
  ADD COLUMN IF NOT EXISTS logo_storage_path text;

COMMENT ON COLUMN public.website_briefs.contact_phone IS
  'Primary business phone from wizard intake.';

COMMENT ON COLUMN public.website_briefs.contact_email IS
  'Primary business email from wizard intake.';

COMMENT ON COLUMN public.website_briefs.contact_address IS
  'Street address from wizard intake.';

COMMENT ON COLUMN public.website_briefs.social_media IS
  'Social profile URLs or handles (multiline text).';

COMMENT ON COLUMN public.website_briefs.logo_storage_path IS
  'Supabase Storage object path for uploaded logo asset.';
