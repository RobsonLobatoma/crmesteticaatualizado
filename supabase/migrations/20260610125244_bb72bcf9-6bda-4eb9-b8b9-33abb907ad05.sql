
-- =====================================================================
-- RECONSTRUÇÃO COMPLETA DO BANCO — Estética Acas CRM (v2)
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin','admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ---------- USER_ROLES (criar PRIMEIRO para has_role poder ser definido) ----------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

DROP POLICY IF EXISTS "user_roles_select_self_or_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_self_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));
DROP POLICY IF EXISTS "user_roles_manage_super_admin" ON public.user_roles;
CREATE POLICY "user_roles_manage_super_admin" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'::public.app_role));

-- ---------- PROFILES ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- HANDLE_NEW_USER ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total int;
BEGIN
  INSERT INTO public.profiles(id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  SELECT COUNT(*) INTO v_total FROM public.user_roles WHERE role='super_admin'::public.app_role;
  IF v_total = 0 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'super_admin'::public.app_role)
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user'::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles(id, email, display_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email,'@',1))
FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id WHERE p.id IS NULL;

INSERT INTO public.user_roles(user_id, role)
SELECT u.id, 'super_admin'::public.app_role FROM auth.users u
ORDER BY u.created_at ASC LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;

-- ---------- APP_SETTINGS ----------
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_settings_all_authenticated" ON public.app_settings;
CREATE POLICY "app_settings_all_authenticated" ON public.app_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
DROP TRIGGER IF EXISTS trg_app_settings_updated ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- LEADS ----------
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data text, responsavel text, nome text NOT NULL, contato text NOT NULL,
  email text, origem text DEFAULT 'Manual', procedimento text, status text DEFAULT 'Novo lead',
  data_entrada text, data_ultimo_contato text, data_agendamento text, data_avaliacao text,
  data_procedimento text, compareceu text, data_fechamento text, valor_fechado text, observacao text,
  data_nascimento text, cpf text, cep text, endereco text, bairro text, cidade text, estado text,
  numero text, complemento text, tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_own_or_admin" ON public.leads;
CREATE POLICY "leads_own_or_admin" ON public.leads FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
DROP TRIGGER IF EXISTS trg_leads_updated ON public.leads;
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- LEAD_TAGS ----------
CREATE TABLE IF NOT EXISTS public.lead_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, color text NOT NULL DEFAULT '#3b82f6',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_tags TO authenticated;
GRANT ALL ON public.lead_tags TO service_role;
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lead_tags_own_or_admin" ON public.lead_tags;
CREATE POLICY "lead_tags_own_or_admin" ON public.lead_tags FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));

-- ---------- PRONTUARIO ----------
CREATE TABLE IF NOT EXISTS public.prontuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo text NOT NULL, titulo text NOT NULL, conteudo text, profissional text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prontuario TO authenticated;
GRANT ALL ON public.prontuario TO service_role;
ALTER TABLE public.prontuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prontuario_own_or_admin" ON public.prontuario;
CREATE POLICY "prontuario_own_or_admin" ON public.prontuario FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));

-- ---------- CLIENTS ----------
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, phone text, email text, address text, birth_date date, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_all_authenticated" ON public.clients;
CREATE POLICY "clients_all_authenticated" ON public.clients FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);
DROP TRIGGER IF EXISTS trg_clients_updated ON public.clients;
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- PROFESSIONALS ----------
CREATE TABLE IF NOT EXISTS public.professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, role text, color text DEFAULT '#3b82f6',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "professionals_all_authenticated" ON public.professionals;
CREATE POLICY "professionals_all_authenticated" ON public.professionals FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);
DROP TRIGGER IF EXISTS trg_professionals_updated ON public.professionals;
CREATE TRIGGER trg_professionals_updated BEFORE UPDATE ON public.professionals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- ROOMS ----------
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, capacity int, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rooms_all_authenticated" ON public.rooms;
CREATE POLICY "rooms_all_authenticated" ON public.rooms FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

-- ---------- EQUIPMENTS ----------
CREATE TABLE IF NOT EXISTS public.equipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipments TO authenticated;
GRANT ALL ON public.equipments TO service_role;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "equipments_all_authenticated" ON public.equipments;
CREATE POLICY "equipments_all_authenticated" ON public.equipments FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

-- ---------- SERVICES ----------
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, price numeric(10,2), duration_minutes int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_all_authenticated" ON public.services;
CREATE POLICY "services_all_authenticated" ON public.services FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

-- ---------- PROFESSIONAL_ABSENCES ----------
CREATE TABLE IF NOT EXISTS public.professional_absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  start_date date NOT NULL, end_date date NOT NULL,
  start_time time, end_time time,
  absence_type text NOT NULL DEFAULT 'day', reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_absences TO authenticated;
GRANT ALL ON public.professional_absences TO service_role;
ALTER TABLE public.professional_absences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "absences_all_authenticated" ON public.professional_absences;
CREATE POLICY "absences_all_authenticated" ON public.professional_absences FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

-- ---------- APPOINTMENTS ----------
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_ids uuid[],
  professional_id uuid REFERENCES public.professionals(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  equipment_id uuid REFERENCES public.equipments(id) ON DELETE SET NULL,
  start_datetime timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  notes text, recurrence_type text DEFAULT 'none',
  status text NOT NULL DEFAULT 'agendado',
  send_sms boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appointments_all_authenticated" ON public.appointments;
CREATE POLICY "appointments_all_authenticated" ON public.appointments FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON public.appointments(start_datetime);
DROP TRIGGER IF EXISTS trg_appointments_updated ON public.appointments;
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- APPOINTMENT_SALES ----------
CREATE TABLE IF NOT EXISTS public.appointment_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_sales TO authenticated;
GRANT ALL ON public.appointment_sales TO service_role;
ALTER TABLE public.appointment_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appointment_sales_all_authenticated" ON public.appointment_sales;
CREATE POLICY "appointment_sales_all_authenticated" ON public.appointment_sales FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

-- ---------- CRM ----------
CREATE TABLE IF NOT EXISTS public.crm_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, slug text NOT NULL, color text NOT NULL DEFAULT '#3b82f6',
  display_order int NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_statuses TO authenticated;
GRANT ALL ON public.crm_statuses TO service_role;
ALTER TABLE public.crm_statuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_statuses_all_authenticated" ON public.crm_statuses;
CREATE POLICY "crm_statuses_all_authenticated" ON public.crm_statuses FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.crm_responsibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_responsibles TO authenticated;
GRANT ALL ON public.crm_responsibles TO service_role;
ALTER TABLE public.crm_responsibles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_responsibles_all_authenticated" ON public.crm_responsibles;
CREATE POLICY "crm_responsibles_all_authenticated" ON public.crm_responsibles FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  nome text NOT NULL, telefone text NOT NULL, email text,
  status text NOT NULL DEFAULT 'novo_lead',
  responsavel text, origem text,
  ultima_mensagem text, horario_ultima_mensagem timestamptz,
  data_criacao timestamptz NOT NULL DEFAULT now(),
  ultima_interacao timestamptz NOT NULL DEFAULT now(),
  tags text[] DEFAULT '{}', observacoes text,
  total_mensagens int NOT NULL DEFAULT 0,
  mensagens_nao_lidas int NOT NULL DEFAULT 0,
  urgente boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_clients TO authenticated;
GRANT ALL ON public.crm_clients TO service_role;
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_clients_all_authenticated" ON public.crm_clients;
CREATE POLICY "crm_clients_all_authenticated" ON public.crm_clients FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_crm_clients_telefone ON public.crm_clients(telefone);
DROP TRIGGER IF EXISTS trg_crm_clients_updated ON public.crm_clients;
CREATE TRIGGER trg_crm_clients_updated BEFORE UPDATE ON public.crm_clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.crm_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  crm_client_id uuid REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  tipo text NOT NULL, descricao text NOT NULL,
  usuario text DEFAULT 'Sistema', detalhes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_history TO authenticated;
GRANT ALL ON public.crm_history TO service_role;
ALTER TABLE public.crm_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_history_all_authenticated" ON public.crm_history;
CREATE POLICY "crm_history_all_authenticated" ON public.crm_history FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);

-- ---------- WHATSAPP TEMPLATES ----------
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, content text NOT NULL,
  type text NOT NULL DEFAULT 'manual',
  trigger_type text NOT NULL DEFAULT 'keyword',
  trigger_value text, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_templates TO authenticated;
GRANT ALL ON public.whatsapp_templates TO service_role;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_templates_all_authenticated" ON public.whatsapp_templates;
CREATE POLICY "whatsapp_templates_all_authenticated" ON public.whatsapp_templates FOR ALL TO authenticated
  USING (true) WITH CHECK (auth.uid() IS NOT NULL);
DROP TRIGGER IF EXISTS trg_wt_updated ON public.whatsapp_templates;
CREATE TRIGGER trg_wt_updated BEFORE UPDATE ON public.whatsapp_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- PLAYBOOK_MESSAGES ----------
CREATE TABLE IF NOT EXISTS public.playbook_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  etapa text, objetivo text, script text,
  categoria text, pergunta text, acao text, observacao text,
  objecao_comum text, estrategia text, script_exemplo text,
  objecao text, depoimento text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playbook_messages TO authenticated;
GRANT ALL ON public.playbook_messages TO service_role;
ALTER TABLE public.playbook_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "playbook_own_or_admin" ON public.playbook_messages;
CREATE POLICY "playbook_own_or_admin" ON public.playbook_messages FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));
DROP TRIGGER IF EXISTS trg_playbook_updated ON public.playbook_messages;
CREATE TRIGGER trg_playbook_updated BEFORE UPDATE ON public.playbook_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- LESSONS ----------
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL, description text, youtube_url text NOT NULL,
  duration text, display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  video_type text, category text, thumbnail_url text,
  attachment_name text, attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lessons_select_all" ON public.lessons;
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "lessons_modify_admin" ON public.lessons;
CREATE POLICY "lessons_modify_admin" ON public.lessons FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'::public.app_role));
DROP TRIGGER IF EXISTS trg_lessons_updated ON public.lessons;
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  watched_seconds int DEFAULT 0, completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_progress_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_own" ON public.lesson_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP TRIGGER IF EXISTS trg_lp_updated ON public.lesson_progress;
CREATE TRIGGER trg_lp_updated BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- SEED CRM STATUSES ----------
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF v_uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.crm_statuses WHERE user_id=v_uid) THEN
    INSERT INTO public.crm_statuses(user_id,name,slug,color,display_order) VALUES
      (v_uid,'Novo lead','novo_lead','#3b82f6',1),
      (v_uid,'Em contato','em_contato','#f59e0b',2),
      (v_uid,'Agendado','agendado','#8b5cf6',3),
      (v_uid,'Compareceu','compareceu','#06b6d4',4),
      (v_uid,'Fechou','fechou','#10b981',5),
      (v_uid,'Perdido','perdido','#ef4444',6);
  END IF;
END $$;
