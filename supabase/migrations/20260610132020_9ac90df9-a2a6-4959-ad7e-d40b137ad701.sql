
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS end_datetime timestamptz,
  ADD COLUMN IF NOT EXISTS recurrence_parent_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cpf text;
