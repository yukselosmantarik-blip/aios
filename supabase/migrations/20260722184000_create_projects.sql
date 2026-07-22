-- AIOS CRM: projects table
-- Every project belongs to one customer and one owner (authenticated user).

DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  customer_id uuid NOT NULL REFERENCES public.customers (id) ON DELETE RESTRICT,
  description text,
  status text NOT NULL DEFAULT 'planned',
  priority text NOT NULL DEFAULT 'medium',
  start_date date,
  end_date date,
  owner_id uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT projects_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT projects_status_valid CHECK (
    status IN ('planned', 'active', 'paused', 'completed')
  ),
  CONSTRAINT projects_priority_valid CHECK (
    priority IN ('low', 'medium', 'high')
  )
);

COMMENT ON TABLE public.projects IS
  'Customer-linked projects. v1: table view with status and priority only.';

COMMENT ON COLUMN public.projects.customer_id IS
  'Customer this project belongs to. Must be owned by the same user as the project.';

COMMENT ON COLUMN public.projects.status IS
  'Lifecycle: planned | active | paused | completed';

COMMENT ON COLUMN public.projects.priority IS
  'Priority: low | medium | high';

CREATE INDEX projects_owner_id_idx
  ON public.projects (owner_id);

CREATE INDEX projects_owner_id_status_idx
  ON public.projects (owner_id, status);

CREATE INDEX projects_owner_id_created_at_desc_idx
  ON public.projects (owner_id, created_at DESC);

CREATE INDEX projects_customer_id_idx
  ON public.projects (customer_id);

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select_own
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY projects_insert_own
  ON public.projects
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

CREATE POLICY projects_update_own
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.customers AS c
      WHERE c.id = customer_id
        AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY projects_delete_own
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());
