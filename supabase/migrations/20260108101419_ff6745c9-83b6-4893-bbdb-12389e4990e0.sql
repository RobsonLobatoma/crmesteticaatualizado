-- Tabela de logs de auditoria para rastrear ações sensíveis
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance em consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: apenas super_admin pode visualizar logs de auditoria
CREATE POLICY "Super admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Política: usuários autenticados podem inserir logs (para suas próprias ações)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Função para registrar logs de auditoria
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Trigger function para auditoria automática de leads
CREATE OR REPLACE FUNCTION public.audit_leads_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_action('INSERT', 'leads', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Só loga se dados sensíveis mudaram
    IF OLD.cpf IS DISTINCT FROM NEW.cpf 
       OR OLD.telefone IS DISTINCT FROM NEW.telefone
       OR OLD.endereco IS DISTINCT FROM NEW.endereco
       OR OLD.cep IS DISTINCT FROM NEW.cep THEN
      PERFORM public.log_audit_action('UPDATE_SENSITIVE', 'leads', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_action('DELETE', 'leads', OLD.id, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Criar trigger de auditoria para leads
DROP TRIGGER IF EXISTS trigger_audit_leads ON public.leads;
CREATE TRIGGER trigger_audit_leads
AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.audit_leads_changes();

-- Trigger function para auditoria automática de clients
CREATE OR REPLACE FUNCTION public.audit_clients_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_action('INSERT', 'clients', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.cpf IS DISTINCT FROM NEW.cpf 
       OR OLD.phone IS DISTINCT FROM NEW.phone
       OR OLD.address IS DISTINCT FROM NEW.address THEN
      PERFORM public.log_audit_action('UPDATE_SENSITIVE', 'clients', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_action('DELETE', 'clients', OLD.id, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Criar trigger de auditoria para clients
DROP TRIGGER IF EXISTS trigger_audit_clients ON public.clients;
CREATE TRIGGER trigger_audit_clients
AFTER INSERT OR UPDATE OR DELETE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.audit_clients_changes();

-- Trigger function para auditoria de crm_clients
CREATE OR REPLACE FUNCTION public.audit_crm_clients_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_action('INSERT', 'crm_clients', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.telefone IS DISTINCT FROM NEW.telefone THEN
      PERFORM public.log_audit_action('UPDATE_SENSITIVE', 'crm_clients', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_action('DELETE', 'crm_clients', OLD.id, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Criar trigger de auditoria para crm_clients
DROP TRIGGER IF EXISTS trigger_audit_crm_clients ON public.crm_clients;
CREATE TRIGGER trigger_audit_crm_clients
AFTER INSERT OR UPDATE OR DELETE ON public.crm_clients
FOR EACH ROW
EXECUTE FUNCTION public.audit_crm_clients_changes();