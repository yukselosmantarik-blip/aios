-- CRM MVP: pipeline statuses, optional contact fields, customer notes

-- Migrate legacy pipeline statuses to new values
UPDATE public.customers SET status = 'qualified' WHERE status = 'meeting';
UPDATE public.customers SET status = 'won' WHERE status = 'customer';
UPDATE public.customers SET status = 'lost' WHERE status = 'inactive';

ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_status_valid;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_status_valid CHECK (
    status IN ('lead', 'contacted', 'qualified', 'proposal', 'won', 'lost')
  );

COMMENT ON COLUMN public.customers.status IS
  'Sales pipeline: lead | contacted | qualified | proposal | won | lost';

ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_contact_first_name_not_empty;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_contact_last_name_not_empty;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_email_not_empty;

ALTER TABLE public.customers
  ALTER COLUMN contact_first_name DROP NOT NULL,
  ALTER COLUMN contact_last_name DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_contact_first_name_not_empty CHECK (
    contact_first_name IS NULL OR char_length(trim(contact_first_name)) > 0
  );

ALTER TABLE public.customers
  ADD CONSTRAINT customers_contact_last_name_not_empty CHECK (
    contact_last_name IS NULL OR char_length(trim(contact_last_name)) > 0
  );

ALTER TABLE public.customers
  ADD CONSTRAINT customers_email_not_empty CHECK (
    email IS NULL OR char_length(trim(email)) > 0
  );

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
