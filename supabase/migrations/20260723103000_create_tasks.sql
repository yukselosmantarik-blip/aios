-- AIOS: tasks table
-- Every task belongs to one project and one authenticated user.

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tasks_title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT tasks_status_valid CHECK (
    status IN ('todo', 'in_progress', 'done')
  ),
  CONSTRAINT tasks_priority_valid CHECK (
    priority IN ('low', 'medium', 'high')
  )
);

COMMENT ON TABLE public.tasks IS
  'Project-linked tasks. v1: schema and RLS only.';

COMMENT ON COLUMN public.tasks.user_id IS
  'Authenticated user who owns this task. Used for RLS.';

COMMENT ON COLUMN public.tasks.project_id IS
  'Project this task belongs to.';

COMMENT ON COLUMN public.tasks.status IS
  'Workflow: todo | in_progress | done';

COMMENT ON COLUMN public.tasks.priority IS
  'Priority: low | medium | high';

CREATE INDEX tasks_user_id_idx
  ON public.tasks (user_id);

CREATE INDEX tasks_user_id_status_idx
  ON public.tasks (user_id, status);

CREATE INDEX tasks_user_id_created_at_desc_idx
  ON public.tasks (user_id, created_at DESC);

CREATE INDEX tasks_project_id_idx
  ON public.tasks (project_id);

CREATE INDEX tasks_user_id_project_id_idx
  ON public.tasks (user_id, project_id);

CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_select_own
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY tasks_insert_own
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY tasks_update_own
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY tasks_delete_own
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
