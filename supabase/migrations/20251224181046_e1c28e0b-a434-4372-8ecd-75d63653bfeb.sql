-- Add UNIQUE constraint on app_settings.key to prevent duplicates and enable proper upsert
ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_key_unique UNIQUE (key);

-- Super Admin bypass RLS policies for all tenant tables

-- clients table
CREATE POLICY "Super admins can view all clients"
ON public.clients FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all clients"
ON public.clients FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all clients"
ON public.clients FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- appointments table
CREATE POLICY "Super admins can view all appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all appointments"
ON public.appointments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- services table
CREATE POLICY "Super admins can view all services"
ON public.services FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all services"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all services"
ON public.services FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all services"
ON public.services FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- professionals table
CREATE POLICY "Super admins can view all professionals"
ON public.professionals FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all professionals"
ON public.professionals FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all professionals"
ON public.professionals FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all professionals"
ON public.professionals FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- rooms table
CREATE POLICY "Super admins can view all rooms"
ON public.rooms FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all rooms"
ON public.rooms FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all rooms"
ON public.rooms FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all rooms"
ON public.rooms FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- equipments table
CREATE POLICY "Super admins can view all equipments"
ON public.equipments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all equipments"
ON public.equipments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all equipments"
ON public.equipments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all equipments"
ON public.equipments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- leads table
CREATE POLICY "Super admins can view all leads"
ON public.leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all leads"
ON public.leads FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all leads"
ON public.leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- professional_absences table
CREATE POLICY "Super admins can view all absences"
ON public.professional_absences FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all absences"
ON public.professional_absences FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all absences"
ON public.professional_absences FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all absences"
ON public.professional_absences FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- appointment_sales table
CREATE POLICY "Super admins can view all sales"
ON public.appointment_sales FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert all sales"
ON public.appointment_sales FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all sales"
ON public.appointment_sales FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all sales"
ON public.appointment_sales FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));