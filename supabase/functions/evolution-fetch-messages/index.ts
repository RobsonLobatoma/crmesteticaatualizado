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

interface FetchMessagesRequest {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
  phoneNumber: string;
  limit?: number;
}

interface EvolutionMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message?: {
    conversation?: string;
    extendedTextMessage?: { text?: string };
    imageMessage?: { caption?: string; url?: string };
    audioMessage?: { url?: string };
    documentMessage?: { fileName?: string; url?: string };
  };
  messageTimestamp?: number | string;
  messageType?: string;
}

interface EvolutionMessagesResponse {
  messages?: {
    records?: EvolutionMessage[];
  };
  records?: EvolutionMessage[];
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

    const body: FetchMessagesRequest = await req.json();
    const { evolutionApiUrl, evolutionApiKey, instanceName, phoneNumber, limit = 50 } = body;

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios faltando" }),
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

    // Format phone number for WhatsApp JID - handle both regular numbers and LID format
    let remoteJid = phoneNumber;
    if (!phoneNumber.includes("@")) {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      remoteJid = `${cleanPhone}@s.whatsapp.net`;
    }

    const endpoint = `${apiUrl.origin}/chat/findMessages/${encodeURIComponent(normalizedInstanceName)}`;
    console.log(`Fetching messages from: ${endpoint} for ${remoteJid}`);

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
          where: {
            key: { remoteJid },
          },
          limit,
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
          JSON.stringify({ error: `Erro da API: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rawData = await response.json();
      console.log("Raw response type:", typeof rawData, "isArray:", Array.isArray(rawData));
      
      // Evolution API v2 can return messages in different formats
      let messageList: EvolutionMessage[] = [];
      
      if (Array.isArray(rawData)) {
        // Direct array of messages
        messageList = rawData;
      } else if (rawData?.messages?.records && Array.isArray(rawData.messages.records)) {
        // Nested in messages.records
        messageList = rawData.messages.records;
      } else if (rawData?.records && Array.isArray(rawData.records)) {
        // Nested in records
        messageList = rawData.records;
      } else if (rawData?.messages && Array.isArray(rawData.messages)) {
        // Nested in messages
        messageList = rawData.messages;
      }

      console.log(`Found ${messageList.length} messages`);

      // Transform to our format
      const messages = messageList.map((msg) => {
        let content = "";
        let type: "text" | "image" | "audio" | "document" | "video" = "text";
        let mediaUrl: string | undefined = undefined;

        if (msg.message?.conversation) {
          content = msg.message.conversation;
          type = "text";
        } else if (msg.message?.extendedTextMessage?.text) {
          content = msg.message.extendedTextMessage.text;
          type = "text";
        } else if (msg.message?.imageMessage) {
          content = msg.message.imageMessage.caption || "[Imagem]";
          type = "image";
          mediaUrl = msg.message.imageMessage.url || undefined;
        } else if (msg.message?.audioMessage) {
          content = "[Áudio]";
          type = "audio";
          mediaUrl = msg.message.audioMessage.url || undefined;
        } else if (msg.message?.documentMessage) {
          content = msg.message.documentMessage.fileName || "[Documento]";
          type = "document";
          mediaUrl = msg.message.documentMessage.url || undefined;
        } else if ((msg.message as Record<string, unknown>)?.videoMessage) {
          const videoMsg = (msg.message as Record<string, { caption?: string; url?: string }>).videoMessage;
          content = videoMsg?.caption || "[Vídeo]";
          type = "video";
          mediaUrl = videoMsg?.url || undefined;
        }

        // Handle timestamp - can be number or string
        let timestamp: number;
        if (typeof msg.messageTimestamp === "string") {
          timestamp = parseInt(msg.messageTimestamp, 10);
        } else {
          timestamp = msg.messageTimestamp || 0;
        }

        return {
          id: msg.key?.id || `msg-${Date.now()}-${Math.random()}`,
          direction: msg.key?.fromMe ? "outbound" : "inbound",
          type,
          content,
          mediaUrl,
          sentAt: timestamp
            ? new Date(timestamp * 1000).toISOString()
            : new Date().toISOString(),
        };
      }).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

      return new Response(
        JSON.stringify({ messages }),
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
