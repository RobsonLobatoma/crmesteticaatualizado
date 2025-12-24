-- Allow all authenticated users to read the appointment form config (not sensitive data)
CREATE POLICY "Authenticated users can read form config"
ON public.app_settings
FOR SELECT
TO authenticated
USING (key = 'appointment_form_config');

-- Ensure super admins can update any settings (drop and recreate to ensure it works)
DROP POLICY IF EXISTS "Super admins can update settings" ON public.app_settings;

CREATE POLICY "Super admins can update settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'super_admin'
  )
);