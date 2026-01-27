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

interface CheckStatusRequest {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
}

interface EvolutionInstance {
  instance: {
    instanceName: string;
    instanceId?: string;
    owner?: string;
    profileName?: string;
    profilePictureUrl?: string;
    profileStatus?: string;
    status?: string;
    serverUrl?: string;
    apikey?: string;
    integration?: string;
  };
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

    const body: CheckStatusRequest = await req.json();
    const { evolutionApiUrl, evolutionApiKey, instanceName } = body;

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName) {
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

    // Get instance connection status
    const connectionEndpoint = `${apiUrl.origin}/instance/connectionState/${encodeURIComponent(normalizedInstanceName)}`;
    console.log(`Checking connection state: ${connectionEndpoint}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(connectionEndpoint, {
        method: "GET",
        headers: {
          "apikey": normalizedApiKey,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return new Response(
            JSON.stringify({ 
              status: "disconnected",
              error: "Instância não encontrada" 
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response.status === 401 || response.status === 403) {
          return new Response(
            JSON.stringify({ 
              status: "error",
              error: "Credenciais inválidas" 
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            status: "error",
            error: `Erro da API: ${response.status}` 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      console.log("Connection state:", data);

      // Map Evolution API states to our status types
      let status: "connected" | "disconnected" | "pending_qr" | "error" = "disconnected";
      
      const state = data.instance?.state || data.state;
      if (state === "open" || state === "connected") {
        status = "connected";
      } else if (state === "connecting" || state === "qr") {
        status = "pending_qr";
      } else if (state === "close" || state === "disconnected") {
        status = "disconnected";
      }

      // Try to get profile info for phone number
      let phoneNumber: string | null = null;
      let profileName: string | null = null;

      if (status === "connected") {
        try {
          const fetchEndpoint = `${apiUrl.origin}/instance/fetchInstances?instanceName=${encodeURIComponent(normalizedInstanceName)}`;
          const instanceResponse = await fetch(fetchEndpoint, {
            method: "GET",
            headers: {
              "apikey": normalizedApiKey,
              "Content-Type": "application/json",
            },
          });

          if (instanceResponse.ok) {
            const instances: EvolutionInstance[] = await instanceResponse.json();
            const instance = instances[0];
            if (instance?.instance) {
              phoneNumber = instance.instance.owner?.replace("@s.whatsapp.net", "") || null;
              profileName = instance.instance.profileName || null;
            }
          }
        } catch (e) {
          console.log("Could not fetch profile info:", e);
        }
      }

      return new Response(
        JSON.stringify({ 
          status,
          phoneNumber,
          profileName,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return new Response(
          JSON.stringify({ status: "error", error: "Tempo esgotado" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rawMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      const isDnsError = /dns error|failed to lookup address|name or service not known/i.test(rawMessage);
      if (isDnsError) {
        return new Response(
          JSON.stringify({
            status: "error",
            error: `Não foi possível resolver o domínio "${apiUrl.hostname}". Verifique se o subdomínio existe no DNS (A/CNAME) e se a Evolution API está acessível publicamente.`,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ status: "error", error: "Erro ao conectar" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ status: "error", error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});