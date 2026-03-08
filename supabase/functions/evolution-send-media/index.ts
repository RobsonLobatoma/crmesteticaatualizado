import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeEvolutionApiUrl(input: string) {
  const trimmed = input.trim();
  const fixed = trimmed.replace(/^(https?:)(https?:\/\/)/i, "$2");
  const withProtocol = !/^https?:\/\//i.test(fixed) ? `https://${fixed}` : fixed;
  return withProtocol.replace(/\/+$/, "");
}

interface SendMediaRequest {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
  phoneNumber: string;
  mediaType: string; // "image" | "video" | "audio" | "document"
  base64: string;
  fileName: string;
  mimeType: string;
  caption?: string;
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

    const body: SendMediaRequest = await req.json();
    const { evolutionApiUrl, evolutionApiKey, instanceName, phoneNumber, mediaType, base64, fileName, mimeType, caption } = body;

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName || !phoneNumber || !base64 || !mediaType) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios faltando" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedUrl = normalizeEvolutionApiUrl(evolutionApiUrl);

    // Format phone number
    let number = phoneNumber;
    if (phoneNumber.includes("@")) {
      number = phoneNumber;
    } else {
      number = phoneNumber.replace(/\D/g, "");
    }

    // Evolution API v2 sendMedia endpoint
    const endpoint = `${normalizedUrl}/message/sendMedia/${encodeURIComponent(instanceName.trim())}`;
    console.log(`Sending media to: ${endpoint}, type: ${mediaType}`);

    const mediaPayload: Record<string, unknown> = {
      number,
      mediatype: mediaType,
      media: `data:${mimeType};base64,${base64}`,
      fileName: fileName || "file",
    };

    if (caption) {
      mediaPayload.caption = caption;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": evolutionApiKey.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mediaPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Evolution API error: ${response.status} - ${errorText}`);
        return new Response(
          JSON.stringify({ error: `Erro da API: ${response.status}`, details: errorText?.slice(0, 300) }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ success: true, data }),
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
