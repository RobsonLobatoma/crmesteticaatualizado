-- Allow authenticated users to check their own roles (needed for has_role function to work)
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);