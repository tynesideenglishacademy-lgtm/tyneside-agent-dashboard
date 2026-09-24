ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.agent_registry;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.agent_registry;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.agent_tasks;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.agent_tasks;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.human_approvals;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.human_approvals;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.agent_audit_logs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.agent_audit_logs;

CREATE POLICY agent_registry_admin_all
  ON public.agent_registry
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');

CREATE POLICY agent_tasks_admin_all
  ON public.agent_tasks
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');

CREATE POLICY human_approvals_admin_all
  ON public.human_approvals
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');

CREATE POLICY agent_audit_logs_admin_all
  ON public.agent_audit_logs
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');
