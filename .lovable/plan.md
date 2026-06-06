Plano para corrigir o cadastro com e-mail e senha:

1. Ajustar a conexão Supabase no frontend
   - Trocar o cliente Supabase para usar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do ambiente conectado, em vez de valores fixos no código.
   - Adicionar uma validação clara caso as variáveis estejam ausentes, evitando erro genérico `Failed to fetch`.

2. Corrigir o fluxo de criação de conta
   - Revisar `AuthProvider` e garantir que `signUp` use o redirect correto para o app atual.
   - Melhorar o tratamento de erro para exibir mensagens úteis quando o Supabase bloquear cadastro, e-mail/senha estiver desativado ou houver problema de conexão.

3. Separar o problema do Google
   - O erro do print `Unsupported provider: provider is not enabled` vem do botão “Continuar com Google”, não do cadastro por e-mail.
   - Vou ocultar/desativar esse botão ou alterar a mensagem enquanto o Google não estiver habilitado no Supabase, para não confundir o usuário.

4. Validar o resultado
   - Conferir se o app passa a chamar o Supabase correto no cadastro.
   - Verificar que o erro visual deixa de ser apenas `Failed to fetch` e que o fluxo de cadastro por e-mail/senha fica funcional ou mostra a configuração pendente correta.