-- AIOS: Website Agent v1
-- website_briefs: structured intake per agent
-- website_blueprints: generated output (1:1 with brief, regenerate overwrites)

CREATE TABLE public.website_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents (id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers (id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
  business_name text NOT NULL,
  industry text NOT NULL,
  location text,
  website_goal text NOT NULL,
  target_audience text NOT NULL,
  services text,
  unique_selling_points text,
  preferred_style text,
  primary_color text,
  secondary_color text,
  required_pages text,
  required_features text,
  reference_websites text,
  additional_notes text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT website_briefs_business_name_not_empty CHECK (
    char_length(trim(business_name)) > 0
  ),
  CONSTRAINT website_briefs_industry_not_empty CHECK (
    char_length(trim(industry)) > 0
  ),
  CONSTRAINT website_briefs_website_goal_not_empty CHECK (
    char_length(trim(website_goal)) > 0
  ),
  CONSTRAINT website_briefs_target_audience_not_empty CHECK (
    char_length(trim(target_audience)) > 0
  ),
  CONSTRAINT website_briefs_status_valid CHECK (
    status IN ('draft', 'ready', 'completed')
  )
);

COMMENT ON TABLE public.website_briefs IS
  'Structured website requirements for a Website Agent. v1: schema and RLS only.';

COMMENT ON COLUMN public.website_briefs.user_id IS
  'Authenticated user who owns this brief. Used for RLS.';

COMMENT ON COLUMN public.website_briefs.agent_id IS
  'Agent this brief belongs to.';

COMMENT ON COLUMN public.website_briefs.status IS
  'Lifecycle: draft | ready | completed';

CREATE INDEX website_briefs_user_id_idx
  ON public.website_briefs (user_id);

CREATE INDEX website_briefs_agent_id_idx
  ON public.website_briefs (agent_id);

CREATE INDEX website_briefs_user_id_agent_id_created_at_desc_idx
  ON public.website_briefs (user_id, agent_id, created_at DESC);

CREATE INDEX website_briefs_customer_id_idx
  ON public.website_briefs (customer_id);

CREATE INDEX website_briefs_project_id_idx
  ON public.website_briefs (project_id);

CREATE TRIGGER website_briefs_set_updated_at
  BEFORE UPDATE ON public.website_briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.website_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY website_briefs_select_own
  ON public.website_briefs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY website_briefs_insert_own
  ON public.website_briefs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY website_briefs_update_own
  ON public.website_briefs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY website_briefs_delete_own
  ON public.website_briefs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.website_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  brief_id uuid NOT NULL UNIQUE REFERENCES public.website_briefs (id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.website_blueprints IS
  'Deterministic website blueprint output. One row per brief; regenerate overwrites.';

COMMENT ON COLUMN public.website_blueprints.user_id IS
  'Authenticated user who owns this blueprint. Used for RLS.';

COMMENT ON COLUMN public.website_blueprints.brief_id IS
  'Brief this blueprint was generated from. Unique: 1:1 in v1.';

COMMENT ON COLUMN public.website_blueprints.content IS
  'Structured blueprint sections and master prompt (JSON).';

CREATE INDEX website_blueprints_user_id_idx
  ON public.website_blueprints (user_id);

CREATE INDEX website_blueprints_brief_id_idx
  ON public.website_blueprints (brief_id);

CREATE TRIGGER website_blueprints_set_updated_at
  BEFORE UPDATE ON public.website_blueprints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.website_blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY website_blueprints_select_own
  ON public.website_blueprints
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY website_blueprints_insert_own
  ON public.website_blueprints
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY website_blueprints_update_own
  ON public.website_blueprints
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY website_blueprints_delete_own
  ON public.website_blueprints
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
