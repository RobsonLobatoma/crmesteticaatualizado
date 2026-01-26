-- Create whatsapp_templates table for message templates
CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual' CHECK (type IN ('manual', 'automatic')),
  trigger_type TEXT DEFAULT 'keyword' CHECK (trigger_type IN ('keyword', 'event')),
  trigger_value TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can view own templates" 
ON public.whatsapp_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates" 
ON public.whatsapp_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" 
ON public.whatsapp_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" 
ON public.whatsapp_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for super admins
CREATE POLICY "Super admins can view all templates" 
ON public.whatsapp_templates 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all templates" 
ON public.whatsapp_templates 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all templates" 
ON public.whatsapp_templates 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all templates" 
ON public.whatsapp_templates 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'));

-- Trigger for updated_at
CREATE TRIGGER update_whatsapp_templates_updated_at
BEFORE UPDATE ON public.whatsapp_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_whatsapp_templates_user_id ON public.whatsapp_templates(user_id);
CREATE INDEX idx_whatsapp_templates_is_active ON public.whatsapp_templates(is_active);