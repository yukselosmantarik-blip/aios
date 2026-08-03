-- Idempotent: create customer_notes if the CRM migration was not applied yet.

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT customer_notes_body_not_empty CHECK (char_length(trim(body)) > 0)
);

COMMENT ON TABLE public.customer_notes IS
  'Timestamped CRM notes attached to a customer record.';

CREATE INDEX IF NOT EXISTS customer_notes_customer_id_created_at_desc_idx
  ON public.customer_notes (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS customer_notes_owner_id_idx
  ON public.customer_notes (owner_id);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_notes_select_own ON public.customer_notes;
CREATE POLICY customer_notes_select_own
  ON public.customer_notes
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.customers AS c
      WHERE c.id = customer_id
        AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS customer_notes_insert_own ON public.customer_notes;
CREATE POLICY customer_notes_insert_own
  ON public.customer_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.customers AS c
      WHERE c.id = customer_id
        AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS customer_notes_delete_own ON public.customer_notes;
CREATE POLICY customer_notes_delete_own
  ON public.customer_notes
  FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.customers AS c
      WHERE c.id = customer_id
        AND c.owner_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';
