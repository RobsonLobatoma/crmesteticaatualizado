
-- Table for CRM history events (shared between Kanban and Clientes modules)
CREATE TABLE public.crm_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  crm_client_id uuid REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  descricao text NOT NULL,
  usuario text NOT NULL DEFAULT 'Sistema',
  detalhes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON public.crm_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.crm_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.crm_history FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all history" ON public.crm_history FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can insert all history" ON public.crm_history FOR INSERT WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can delete all history" ON public.crm_history FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Table for clinical records (prontuário)
CREATE TABLE public.prontuario (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'evolucao',
  titulo text NOT NULL,
  conteudo text,
  profissional text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.prontuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prontuario" ON public.prontuario FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prontuario" ON public.prontuario FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prontuario" ON public.prontuario FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prontuario" ON public.prontuario FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all prontuario" ON public.prontuario FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can insert all prontuario" ON public.prontuario FOR INSERT WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can update all prontuario" ON public.prontuario FOR UPDATE USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can delete all prontuario" ON public.prontuario FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX idx_crm_history_lead_id ON public.crm_history(lead_id);
CREATE INDEX idx_crm_history_crm_client_id ON public.crm_history(crm_client_id);
CREATE INDEX idx_prontuario_lead_id ON public.prontuario(lead_id);
