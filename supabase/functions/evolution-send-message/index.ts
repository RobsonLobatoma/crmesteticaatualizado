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
  const withProtocol = !/^https?:\/\//i.test(fixed) ? `https://${fixed}` : fixed;
  // Remove trailing slashes
  return withProtocol.replace(/\/+$/, "");
}

function isLikelyValidHostname(hostname: string) {
  const h = hostname.toLowerCase();
  if (!h) return false;
  if (h === "https" || h === "http") return false;
  if (h === "localhost") return true;
  return h.includes(".");
}

interface SendMessageRequest {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
  phoneNumber: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const body: SendMessageRequest = await req.json();
    const { evolutionApiUrl, evolutionApiKey, instanceName, phoneNumber, message } = body;

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName || !phoneNumber || !message) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios faltando" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize inputs
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
          error: "URL da API inválida (hostname). Verifique se está no formato https://seu-dominio",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Evolution API v2 endpoint for sending text messages
    const endpoint = `${apiUrl.origin}/message/sendText/${encodeURIComponent(normalizedInstanceName)}`;
    console.log(`Sending message to: ${cleanPhone} via ${endpoint}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": normalizedApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
          delay: 1000,
          linkPreview: false,
        }),
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
          JSON.stringify({ error: `Erro ao enviar mensagem: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);

      return new Response(
        JSON.stringify({ 
          success: true,
          messageId: data.key?.id || null,
          sentAt: new Date().toISOString(),
        }),
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