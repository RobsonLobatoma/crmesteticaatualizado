-- Tabela para armazenar mensagens do Playbook
CREATE TABLE public.playbook_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL, -- 'protocolo', 'sondagem', 'fechamento', 'objecoes', 'depoimentos'
  
  -- Campos para Protocolo de Atendimento
  etapa TEXT,
  objetivo TEXT,
  script TEXT,
  
  -- Campos para Sondagem
  categoria TEXT,
  pergunta TEXT,
  
  -- Campos para Fechamento
  acao TEXT,
  observacao TEXT,
  
  -- Campos para Objeções
  objecao_comum TEXT,
  estrategia TEXT,
  script_exemplo TEXT,
  
  -- Campos para Depoimentos
  objecao TEXT,
  depoimento TEXT,
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.playbook_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own playbook messages" 
ON public.playbook_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playbook messages" 
ON public.playbook_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playbook messages" 
ON public.playbook_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playbook messages" 
ON public.playbook_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Super admin policies
CREATE POLICY "Super admins can view all playbook messages"
ON public.playbook_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all playbook messages"
ON public.playbook_messages
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all playbook messages"
ON public.playbook_messages
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all playbook messages"
ON public.playbook_messages
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_playbook_messages_updated_at
BEFORE UPDATE ON public.playbook_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_playbook_messages_user_category ON public.playbook_messages(user_id, category);
CREATE INDEX idx_playbook_messages_display_order ON public.playbook_messages(display_order);