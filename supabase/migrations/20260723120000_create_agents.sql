-- AIOS: agents table
-- Every agent belongs to one authenticated user.

CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  provider text NOT NULL DEFAULT 'openai',
  model text NOT NULL,
  system_prompt text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT agents_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT agents_model_not_empty CHECK (char_length(trim(model)) > 0),
  CONSTRAINT agents_provider_valid CHECK (
    provider IN ('openai', 'anthropic', 'google', 'custom')
  ),
  CONSTRAINT agents_status_valid CHECK (
    status IN ('draft', 'active', 'inactive')
  )
);

COMMENT ON TABLE public.agents IS
  'User-owned AI agent configurations. v1: schema and RLS only.';

COMMENT ON COLUMN public.agents.user_id IS
  'Authenticated user who owns this agent. Used for RLS.';

COMMENT ON COLUMN public.agents.provider IS
  'LLM provider: openai | anthropic | google | custom';

COMMENT ON COLUMN public.agents.model IS
  'Provider model identifier (e.g. gpt-4o, claude-sonnet-4).';

COMMENT ON COLUMN public.agents.system_prompt IS
  'System prompt for the agent. Optional in v1.';

COMMENT ON COLUMN public.agents.status IS
  'Lifecycle: draft | active | inactive';

CREATE INDEX agents_user_id_idx
  ON public.agents (user_id);

CREATE INDEX agents_user_id_status_idx
  ON public.agents (user_id, status);

CREATE INDEX agents_user_id_created_at_desc_idx
  ON public.agents (user_id, created_at DESC);

CREATE TRIGGER agents_set_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_select_own
  ON public.agents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY agents_insert_own
  ON public.agents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY agents_update_own
  ON public.agents
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY agents_delete_own
  ON public.agents
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
