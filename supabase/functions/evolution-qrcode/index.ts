import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QrCodeRequest {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
}

interface EvolutionQrResponse {
  base64?: string;
  code?: string;
  count?: number;
  pairingCode?: string;
  instance?: {
    state?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Verify user is authenticated
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

    // Parse request body
    const body: QrCodeRequest = await req.json();
    const { evolutionApiUrl, evolutionApiKey, instanceName } = body;

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios: evolutionApiUrl, evolutionApiKey, instanceName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL format
    let apiUrl: URL;
    try {
      apiUrl = new URL(evolutionApiUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "URL da API inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Evolution API endpoint
    const connectEndpoint = `${apiUrl.origin}/instance/connect/${encodeURIComponent(instanceName)}`;
    console.log(`Calling Evolution API: ${connectEndpoint}`);

    // Call Evolution API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const evolutionResponse = await fetch(connectEndpoint, {
        method: "GET",
        headers: {
          "apikey": evolutionApiKey,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`Evolution API response status: ${evolutionResponse.status}`);

      if (!evolutionResponse.ok) {
        const errorText = await evolutionResponse.text();
        console.error(`Evolution API error: ${errorText}`);

        if (evolutionResponse.status === 401 || evolutionResponse.status === 403) {
          return new Response(
            JSON.stringify({ error: "Credenciais inválidas. Verifique a API Key." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (evolutionResponse.status === 404) {
          return new Response(
            JSON.stringify({ error: "Instância não encontrada na Evolution API. Verifique o nome da instância." }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: `Erro da Evolution API: ${evolutionResponse.status}` }),
          { status: evolutionResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data: EvolutionQrResponse = await evolutionResponse.json();
      console.log("Evolution API response data keys:", Object.keys(data));

      // Check if already connected
      if (data.instance?.state === "open" || data.instance?.state === "connected") {
        return new Response(
          JSON.stringify({ 
            connected: true,
            message: "Instância já está conectada" 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return QR code data
      if (data.base64) {
        return new Response(
          JSON.stringify({
            base64: data.base64,
            code: data.code || null,
            pairingCode: data.pairingCode || null,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // No QR code in response
      return new Response(
        JSON.stringify({ error: "QR Code não disponível. A instância pode já estar conectada." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return new Response(
          JSON.stringify({ error: "Tempo esgotado. Tente novamente." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com a Evolution API. Verifique a URL." }),
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
