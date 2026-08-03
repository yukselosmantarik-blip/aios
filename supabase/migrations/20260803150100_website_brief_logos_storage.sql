-- Private bucket for website brief logo uploads (path: {user_id}/{brief_or_draft}/...)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-brief-logos',
  'website-brief-logos',
  false,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY website_brief_logos_select_own
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'website-brief-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY website_brief_logos_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'website-brief-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY website_brief_logos_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'website-brief-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'website-brief-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY website_brief_logos_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'website-brief-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
