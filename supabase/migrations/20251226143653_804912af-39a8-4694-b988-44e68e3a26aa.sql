-- Create lesson progress tracking table
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
ON public.lesson_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
ON public.lesson_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
ON public.lesson_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Super admins can view all progress
CREATE POLICY "Super admins can view all progress"
ON public.lesson_progress
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();