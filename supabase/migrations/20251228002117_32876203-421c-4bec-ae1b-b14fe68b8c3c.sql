-- Criar tabela de tags personalizadas para leads
CREATE TABLE public.lead_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-gray-500',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lead_tags
CREATE POLICY "Users can view own tags" 
ON public.lead_tags 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" 
ON public.lead_tags 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" 
ON public.lead_tags 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" 
ON public.lead_tags 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all tags" 
ON public.lead_tags 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert all tags" 
ON public.lead_tags 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all tags" 
ON public.lead_tags 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete all tags" 
ON public.lead_tags 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Adicionar campo tags na tabela leads (array de UUIDs das tags)
ALTER TABLE public.leads 
ADD COLUMN tags TEXT[] DEFAULT '{}';