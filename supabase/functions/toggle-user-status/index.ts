import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Validate authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido')
    }

    // Create user-scoped client to verify identity
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get requesting user
    const { data: { user: requestingUser }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !requestingUser) {
      throw new Error('Não autenticado')
    }

    // Verify super_admin role
    const { data: roleCheck, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'super_admin')
      .maybeSingle()

    if (roleError || !roleCheck) {
      throw new Error('Acesso negado: requer papel de super_admin')
    }

    // Parse request body
    const { userId, action } = await req.json()
    
    if (!userId || typeof userId !== 'string') {
      throw new Error('userId é obrigatório')
    }
    
    if (!action || !['ban', 'unban'].includes(action)) {
      throw new Error('action deve ser "ban" ou "unban"')
    }

    // Prevent self-ban
    if (userId === requestingUser.id) {
      throw new Error('Não é possível pausar a si mesmo')
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Execute ban/unban
    if (action === 'ban') {
      // Ban for 100 years (876600 hours) = effectively permanent
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876600h'
      })
      console.log('Ban result:', { userId, data: data?.user?.banned_until, error })
      if (error) throw error
    } else {
      // Use 'none' to REMOVE the ban
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
      })
      console.log('Unban result:', { userId, data: data?.user?.banned_until, error })
      if (error) throw error
    }

    const message = action === 'ban'
      ? 'Usuário pausado com sucesso'
      : 'Acesso do usuário reativado'

    return new Response(
      JSON.stringify({ success: true, message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('Error in toggle-user-status:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao alterar status do usuário' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
