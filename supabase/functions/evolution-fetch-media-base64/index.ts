import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizeEvolutionApiUrl(input: string) {
  const trimmed = input.trim();
  const fixed = trimmed.replace(/^(https?:)(https?:\/\/)/i, "$2");
  const withProtocol = !/^https?:\/\//i.test(fixed) ? `https://${fixed}` : fixed;
  return withProtocol.replace(/\/+$/, "");
}

interface FetchMediaRequest {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
  messageId: string;
  remoteJid: string;
  mediaUrl?: string;
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

    const body: FetchMediaRequest = await req.json();
    const { evolutionApiUrl, evolutionApiKey, instanceName, messageId, remoteJid, mediaUrl } = body;

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName || !messageId) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios faltando" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedUrl = normalizeEvolutionApiUrl(evolutionApiUrl);
    const normalizedKey = evolutionApiKey.trim();
    const normalizedInstance = instanceName.trim();

    // Strategy 1: Try getBase64FromMediaMessage endpoint
    try {
      const endpoint = `${normalizedUrl}/chat/getBase64FromMediaMessage/${encodeURIComponent(normalizedInstance)}`;
      console.log(`Fetching base64 media from: ${endpoint} for message ${messageId}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": normalizedKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            key: {
              id: messageId,
              remoteJid: remoteJid,
            },
          },
          convertToMp4: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Evolution API v2 returns { base64: "...", mimetype: "..." }
        const base64 = data.base64 || data.data?.base64;
        const mimeType = data.mimetype || data.mimeType || data.data?.mimetype || "application/octet-stream";

        if (base64) {
          console.log(`Successfully got base64 media, mimeType: ${mimeType}, length: ${base64.length}`);
          return new Response(
            JSON.stringify({ base64, mimeType }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.log("Base64 endpoint returned no data, trying fallback...");
      } else {
        console.log(`Base64 endpoint returned ${response.status}, trying fallback...`);
      }
    } catch (e) {
      console.log(`Base64 endpoint failed: ${e instanceof Error ? e.message : e}, trying fallback...`);
    }

    // Strategy 2: Fetch mediaUrl directly server-side (no CORS issue)
    if (mediaUrl) {
      try {
        console.log(`Fallback: fetching media directly from ${mediaUrl.substring(0, 80)}...`);
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 30000);

        const mediaResponse = await fetch(mediaUrl, {
          signal: controller2.signal,
        });

        clearTimeout(timeoutId2);

        if (mediaResponse.ok) {
          const arrayBuffer = await mediaResponse.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          
          // Convert to base64 in chunks to avoid stack overflow
          let binary = "";
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode(...chunk);
          }
          const base64 = btoa(binary);
          
          const mimeType = mediaResponse.headers.get("content-type") || "application/octet-stream";

          console.log(`Successfully fetched media directly, mimeType: ${mimeType}, size: ${bytes.length}`);
          return new Response(
            JSON.stringify({ base64, mimeType }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.log(`Direct fetch failed with status ${mediaResponse.status}`);
      } catch (e) {
        console.log(`Direct fetch failed: ${e instanceof Error ? e.message : e}`);
      }
    }

    return new Response(
      JSON.stringify({ error: "Não foi possível carregar a mídia" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
