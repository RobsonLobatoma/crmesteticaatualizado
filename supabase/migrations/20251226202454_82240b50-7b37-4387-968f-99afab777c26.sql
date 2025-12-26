-- Create CRM statuses table for dynamic Kanban columns
CREATE TABLE public.crm_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM responsibles table for dynamic assignees
CREATE TABLE public.crm_responsibles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on crm_statuses
ALTER TABLE public.crm_statuses ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_statuses
CREATE POLICY "Users can view own statuses"
ON public.crm_statuses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statuses"
ON public.crm_statuses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statuses"
ON public.crm_statuses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own statuses"
ON public.crm_statuses FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all statuses"
ON public.crm_statuses FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert all statuses"
ON public.crm_statuses FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all statuses"
ON public.crm_statuses FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete all statuses"
ON public.crm_statuses FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Enable RLS on crm_responsibles
ALTER TABLE public.crm_responsibles ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_responsibles
CREATE POLICY "Users can view own responsibles"
ON public.crm_responsibles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responsibles"
ON public.crm_responsibles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responsibles"
ON public.crm_responsibles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own responsibles"
ON public.crm_responsibles FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all responsibles"
ON public.crm_responsibles FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert all responsibles"
ON public.crm_responsibles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all responsibles"
ON public.crm_responsibles FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete all responsibles"
ON public.crm_responsibles FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add indexes for performance
CREATE INDEX idx_crm_statuses_user_id ON public.crm_statuses(user_id);
CREATE INDEX idx_crm_statuses_display_order ON public.crm_statuses(display_order);
CREATE INDEX idx_crm_responsibles_user_id ON public.crm_responsibles(user_id);