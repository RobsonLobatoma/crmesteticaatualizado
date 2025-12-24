INSERT INTO public.user_roles (user_id, role)
VALUES ('dec02a62-d336-478c-bdd7-6058401ea39f', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;