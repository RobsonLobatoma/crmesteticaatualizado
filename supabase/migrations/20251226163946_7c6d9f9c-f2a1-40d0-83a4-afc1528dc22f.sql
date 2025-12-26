-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can read form config" ON public.app_settings;

-- Create a new PERMISSIVE policy (default) for authenticated users to read form config
CREATE POLICY "Authenticated users can read form config"
ON public.app_settings
FOR SELECT
TO authenticated
USING (key = 'appointment_form_config');