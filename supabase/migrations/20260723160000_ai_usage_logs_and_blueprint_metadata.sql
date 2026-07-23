-- AIOS Sprint 6: AI usage logging + blueprint generation metadata

ALTER TABLE public.website_blueprints
  ADD COLUMN generation_source text NOT NULL DEFAULT 'deterministic',
  ADD COLUMN generation_provider text,
  ADD COLUMN generation_model text;

ALTER TABLE public.website_blueprints
  ADD CONSTRAINT website_blueprints_generation_source_valid CHECK (
    generation_source IN ('deterministic', 'ai')
  );

COMMENT ON COLUMN public.website_blueprints.generation_source IS
  'How the current blueprint was produced: deterministic | ai';

COMMENT ON COLUMN public.website_blueprints.generation_provider IS
  'AI provider used for the last generation (e.g. openai). Null for deterministic.';

COMMENT ON COLUMN public.website_blueprints.generation_model IS
  'Model used for the last generation (e.g. gpt-4o-mini). Null for deterministic.';

CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents (id) ON DELETE CASCADE,
  brief_id uuid NOT NULL REFERENCES public.website_briefs (id) ON DELETE CASCADE,
  provider text NOT NULL,
  model text NOT NULL,
  status text NOT NULL,
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12, 6),
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ai_usage_logs_provider_not_empty CHECK (
    char_length(trim(provider)) > 0
  ),
  CONSTRAINT ai_usage_logs_model_not_empty CHECK (
    char_length(trim(model)) > 0
  ),
  CONSTRAINT ai_usage_logs_status_valid CHECK (
    status IN ('success', 'failed')
  ),
  CONSTRAINT ai_usage_logs_input_tokens_non_negative CHECK (
    input_tokens IS NULL OR input_tokens >= 0
  ),
  CONSTRAINT ai_usage_logs_output_tokens_non_negative CHECK (
    output_tokens IS NULL OR output_tokens >= 0
  ),
  CONSTRAINT ai_usage_logs_estimated_cost_non_negative CHECK (
    estimated_cost IS NULL OR estimated_cost >= 0
  )
);

COMMENT ON TABLE public.ai_usage_logs IS
  'Minimal audit log for AI enhancement requests. No prompts or responses stored.';

COMMENT ON COLUMN public.ai_usage_logs.status IS
  'Outcome: success | failed';

COMMENT ON COLUMN public.ai_usage_logs.error_code IS
  'Machine-readable failure code (e.g. missing_api_key, timeout, invalid_response).';

CREATE INDEX ai_usage_logs_user_id_created_at_desc_idx
  ON public.ai_usage_logs (user_id, created_at DESC);

CREATE INDEX ai_usage_logs_user_id_status_created_at_desc_idx
  ON public.ai_usage_logs (user_id, status, created_at DESC);

CREATE INDEX ai_usage_logs_brief_id_idx
  ON public.ai_usage_logs (brief_id);

CREATE INDEX ai_usage_logs_agent_id_idx
  ON public.ai_usage_logs (agent_id);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_usage_logs_select_own
  ON public.ai_usage_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY ai_usage_logs_insert_own
  ON public.ai_usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
