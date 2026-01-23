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
    
    // Get auth header from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido')
    }

    // Create client with user's token to verify identity
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Verify the requesting user
    const { data: { user: requestingUser }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !requestingUser) {
      throw new Error('Não autenticado')
    }
    
    // Check if requesting user is super_admin
    const { data: roleCheck, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'super_admin')
      .maybeSingle()
    
    if (roleError) {
      console.error('Error checking role:', roleError)
      throw new Error('Erro ao verificar permissões')
    }
    
    if (!roleCheck) {
      throw new Error('Acesso negado: requer permissão de super_admin')
    }
    
    // Get userId to delete from request body
    const { userId } = await req.json()
    if (!userId) {
      throw new Error('userId é obrigatório')
    }
    
    // Prevent self-deletion
    if (userId === requestingUser.id) {
      throw new Error('Não é possível remover a si mesmo')
    }
    
    // Check if target user is a super_admin and if they're the last one
    const { data: superAdmins, error: superAdminsError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')
    
    if (superAdminsError) {
      console.error('Error fetching super admins:', superAdminsError)
      throw new Error('Erro ao verificar super admins')
    }
    
    const targetIsSuperAdmin = superAdmins?.some(sa => sa.user_id === userId)
    if (targetIsSuperAdmin && (superAdmins?.length || 0) <= 1) {
      throw new Error('Não é possível remover o único super admin do sistema')
    }
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      }
    })
    
    // Delete the user (cascade will handle profiles and user_roles)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw new Error(`Erro ao deletar usuário: ${deleteError.message}`)
    }
    
    console.log(`User ${userId} deleted by super_admin ${requestingUser.id}`)
    
    return new Response(
      JSON.stringify({ success: true, message: 'Usuário removido com sucesso' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error: unknown) {
    console.error('Delete user error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
