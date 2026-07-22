-- AIOS CRM: customers table
-- Spec: docs/CRM_DATA_MODEL.md

-- Reusable trigger function for updated_at (safe to reuse on future tables)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Sets updated_at to now() on row update. Attach via BEFORE UPDATE trigger.';

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  website text,
  industry text,
  contact_first_name text NOT NULL,
  contact_last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  source text,
  status text NOT NULL DEFAULT 'lead',
  owner_id uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT customers_company_name_not_empty CHECK (char_length(trim(company_name)) > 0),
  CONSTRAINT customers_contact_first_name_not_empty CHECK (char_length(trim(contact_first_name)) > 0),
  CONSTRAINT customers_contact_last_name_not_empty CHECK (char_length(trim(contact_last_name)) > 0),
  CONSTRAINT customers_email_not_empty CHECK (char_length(trim(email)) > 0),
  CONSTRAINT customers_status_valid CHECK (
    status IN ('lead', 'contacted', 'meeting', 'proposal', 'customer', 'inactive')
  )
);

COMMENT ON TABLE public.customers IS
  'CRM customer records. One primary contact embedded per row in v1.';

COMMENT ON COLUMN public.customers.status IS
  'Sales pipeline stage: lead → contacted → meeting → proposal → customer | inactive';

COMMENT ON COLUMN public.customers.source IS
  'Acquisition channel (e.g. website, instagram, referral). Free text in v1.';

COMMENT ON COLUMN public.customers.owner_id IS
  'Authenticated user who owns this record. Used for RLS and accountability.';

CREATE INDEX customers_owner_id_idx
  ON public.customers (owner_id);

CREATE INDEX customers_owner_id_status_idx
  ON public.customers (owner_id, status);

CREATE INDEX customers_owner_id_source_idx
  ON public.customers (owner_id, source);

CREATE INDEX customers_owner_id_created_at_desc_idx
  ON public.customers (owner_id, created_at DESC);

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_select_own
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY customers_insert_own
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY customers_update_own
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY customers_delete_own
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());
