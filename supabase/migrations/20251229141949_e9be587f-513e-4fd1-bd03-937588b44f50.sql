-- Criar tabela crm_clients para o Kanban
CREATE TABLE public.crm_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  responsavel TEXT,
  origem TEXT,
  ultima_mensagem TEXT,
  horario_ultima_mensagem TEXT,
  data_criacao TIMESTAMPTZ DEFAULT now(),
  ultima_interacao TIMESTAMPTZ DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  observacoes TEXT,
  total_mensagens INTEGER DEFAULT 0,
  mensagens_nao_lidas INTEGER DEFAULT 0,
  urgente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuário
CREATE POLICY "Users can view own crm_clients" 
ON public.crm_clients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crm_clients" 
ON public.crm_clients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crm_clients" 
ON public.crm_clients 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crm_clients" 
ON public.crm_clients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para super admin
CREATE POLICY "Super admins can view all crm_clients" 
ON public.crm_clients 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert all crm_clients" 
ON public.crm_clients 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all crm_clients" 
ON public.crm_clients 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete all crm_clients" 
ON public.crm_clients 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_crm_clients_updated_at
BEFORE UPDATE ON public.crm_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();