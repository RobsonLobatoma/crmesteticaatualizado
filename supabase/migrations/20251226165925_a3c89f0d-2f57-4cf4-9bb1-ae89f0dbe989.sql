-- Política para usuários autenticados lerem a config global de horários
CREATE POLICY "Authenticated users can read business_hours_config"
ON public.app_settings
FOR SELECT
TO authenticated
USING (key = 'business_hours_config');

-- Política para usuários inserirem suas próprias configurações
CREATE POLICY "Users can insert own settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (key LIKE 'user_' || auth.uid()::text || '_%');

-- Política para usuários atualizarem suas próprias configurações
CREATE POLICY "Users can update own settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (key LIKE 'user_' || auth.uid()::text || '_%')
WITH CHECK (key LIKE 'user_' || auth.uid()::text || '_%');

-- Política para usuários lerem suas próprias configurações
CREATE POLICY "Users can read own settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (key LIKE 'user_' || auth.uid()::text || '_%');