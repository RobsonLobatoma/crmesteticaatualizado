
ALTER TABLE public.appointments
  ALTER COLUMN service_ids SET DEFAULT '{}'::uuid[],
  ALTER COLUMN end_datetime DROP NOT NULL,
  ALTER COLUMN recurrence_parent_id DROP NOT NULL;
