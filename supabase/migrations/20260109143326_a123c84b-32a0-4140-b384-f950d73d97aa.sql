-- Corrige a função de auditoria: troca 'telefone' por 'contato' (nome correto da coluna)
-- e amplia a verificação de campos sensíveis

CREATE OR REPLACE FUNCTION public.audit_leads_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_action('INSERT', 'leads', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Loga se dados sensíveis mudaram (usando 'contato' que é o nome correto da coluna)
    IF OLD.cpf IS DISTINCT FROM NEW.cpf 
       OR OLD.contato IS DISTINCT FROM NEW.contato
       OR OLD.endereco IS DISTINCT FROM NEW.endereco
       OR OLD.cep IS DISTINCT FROM NEW.cep
       OR OLD.numero IS DISTINCT FROM NEW.numero
       OR OLD.bairro IS DISTINCT FROM NEW.bairro
       OR OLD.cidade IS DISTINCT FROM NEW.cidade
       OR OLD.estado IS DISTINCT FROM NEW.estado
       OR OLD.complemento IS DISTINCT FROM NEW.complemento THEN
      PERFORM public.log_audit_action('UPDATE_SENSITIVE', 'leads', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_action('DELETE', 'leads', OLD.id, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;