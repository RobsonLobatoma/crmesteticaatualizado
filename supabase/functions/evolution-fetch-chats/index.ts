import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeEvolutionApiUrl(input: string) {
  const trimmed = input.trim();
  // Fix common misconfiguration saved as "https:https://domain" (double scheme)
  const fixed = trimmed.replace(/^(https?:)(https?:\/\/)/i, "$2");
  // If user saved without protocol, assume https
  if (!/^https?:\/\//i.test(fixed)) return `https://${fixed}`;
  return fixed;
}

function isLikelyValidHostname(hostname: string) {
  const h = hostname.toLowerCase();
  if (!h) return false;
  if (h === "https" || h === "http") return false;
  if (h === "localhost") return true;
  return h.includes(".");
}

interface FetchChatsRequest {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
}

interface EvolutionChat {
  id: string;
  remoteJid: string;
  name?: string;
  pushName?: string;
  profilePictureUrl?: string;
  unreadCount?: number;
  lastMessage?: {
    key: { remoteJid: string; fromMe: boolean };
    message?: { conversation?: string; extendedTextMessage?: { text?: string } };
    messageTimestamp?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token de autenticação não fornecido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: FetchChatsRequest = await req.json();
    const { evolutionApiUrl, evolutionApiKey, instanceName } = body;

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios: evolutionApiUrl, evolutionApiKey, instanceName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEvolutionApiUrl = normalizeEvolutionApiUrl(evolutionApiUrl);
    const normalizedApiKey = evolutionApiKey.trim();
    const normalizedInstanceName = instanceName.trim();

    let apiUrl: URL;
    try {
      apiUrl = new URL(normalizedEvolutionApiUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "URL da API inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isLikelyValidHostname(apiUrl.hostname)) {
      return new Response(
        JSON.stringify({
          error:
            "URL da API inválida (hostname). Verifique se está no formato https://seu-dominio",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Evolution API v2 endpoint for fetching chats
    const endpoint = `${apiUrl.origin}/chat/findChats/${encodeURIComponent(normalizedInstanceName)}`;
    console.log(`Fetching chats from: ${endpoint}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": normalizedApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Evolution API error: ${errorText}`);

        if (response.status === 401 || response.status === 403) {
          return new Response(
            JSON.stringify({
              error: "Credenciais inválidas",
              details: errorText?.slice(0, 300),
            }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: `Erro da API: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data: EvolutionChat[] = await response.json();
      console.log(`Found ${data.length} chats`);

      // Transform to our format
      const chats = data
        .filter((chat) => chat.remoteJid && !chat.remoteJid.includes("@g.us")) // Filter out groups
        .map((chat) => {
          const phoneNumber = chat.remoteJid.replace("@s.whatsapp.net", "");
          const lastMsgContent = 
            chat.lastMessage?.message?.conversation ||
            chat.lastMessage?.message?.extendedTextMessage?.text ||
            "";
          
          return {
            id: chat.id || chat.remoteJid,
            phoneNumber,
            leadName: chat.name || chat.pushName || phoneNumber,
            profilePictureUrl: chat.profilePictureUrl,
            unreadCount: chat.unreadCount || 0,
            lastMessagePreview: lastMsgContent.substring(0, 100),
            lastMessageAt: chat.lastMessage?.messageTimestamp
              ? new Date(Number(chat.lastMessage.messageTimestamp) * 1000).toISOString()
              : new Date().toISOString(),
          };
        })
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      return new Response(
        JSON.stringify({ chats }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return new Response(
          JSON.stringify({ error: "Tempo esgotado" }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

       const rawMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
       const isDnsError = /dns error|failed to lookup address|name or service not known/i.test(rawMessage);
       if (isDnsError) {
         return new Response(
           JSON.stringify({
             error: `Não foi possível resolver o domínio "${apiUrl.hostname}". Verifique se o subdomínio existe no DNS (A/CNAME) e se a Evolution API está acessível publicamente.`,
           }),
           { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }

      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com a Evolution API" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
