import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  messageTimestamp?: number;
  messageType?: string;
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

    let apiUrl: URL;
    try {
      apiUrl = new URL(evolutionApiUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "URL da API inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number for WhatsApp JID
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const remoteJid = `${cleanPhone}@s.whatsapp.net`;

    const endpoint = `${apiUrl.origin}/chat/findMessages/${encodeURIComponent(instanceName)}`;
    console.log(`Fetching messages from: ${endpoint} for ${remoteJid}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": evolutionApiKey,
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

        return new Response(
          JSON.stringify({ error: `Erro da API: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data: EvolutionMessage[] = await response.json();
      console.log(`Found ${data.length} messages`);

      // Transform to our format
      const messages = data.map((msg) => {
        let content = "";
        let type: "text" | "image" | "audio" | "document" = "text";

        if (msg.message?.conversation) {
          content = msg.message.conversation;
          type = "text";
        } else if (msg.message?.extendedTextMessage?.text) {
          content = msg.message.extendedTextMessage.text;
          type = "text";
        } else if (msg.message?.imageMessage) {
          content = msg.message.imageMessage.caption || "[Imagem]";
          type = "image";
        } else if (msg.message?.audioMessage) {
          content = "[Áudio]";
          type = "audio";
        } else if (msg.message?.documentMessage) {
          content = msg.message.documentMessage.fileName || "[Documento]";
          type = "document";
        }

        return {
          id: msg.key.id,
          direction: msg.key.fromMe ? "outbound" : "inbound",
          type,
          content,
          sentAt: msg.messageTimestamp
            ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
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
