import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EvolutionInstanceConfig, WhatsappMessage } from "../types";

interface UseWhatsappMessagesOptions {
  instance: EvolutionInstanceConfig | null;
  phoneNumber: string | null;
  enabled?: boolean;
}

export function useWhatsappMessages({
  instance,
  phoneNumber,
  enabled = true,
}: UseWhatsappMessagesOptions) {
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!instance || !phoneNumber || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Não autenticado");
      }

      const response = await supabase.functions.invoke("evolution-fetch-messages", {
        body: {
          evolutionApiUrl: instance.evolutionApiUrl,
          evolutionApiKey: instance.evolutionApiKey,
          instanceName: instance.evolutionInstanceName,
          phoneNumber,
          limit: 100,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao buscar mensagens");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const fetchedMessages: WhatsappMessage[] = (response.data?.messages || []).map(
        (msg: {
          id: string;
          direction: "inbound" | "outbound";
          type: "text" | "image" | "audio" | "document" | "video";
          content: string;
          mediaUrl?: string;
          sentAt: string;
        }) => ({
          id: msg.id,
          chatId: phoneNumber,
          direction: msg.direction,
          type: msg.type,
          content: msg.content,
          mediaUrl: msg.mediaUrl || undefined,
          sentAt: msg.sentAt,
        })
      );

      setMessages(fetchedMessages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("Erro ao buscar mensagens:", err);
    } finally {
      setIsLoading(false);
    }
  }, [instance, phoneNumber, enabled]);

  // Fetch when phone changes
  useEffect(() => {
    if (instance && phoneNumber && enabled) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [instance?.id, phoneNumber, enabled, fetchMessages]);

  // Add optimistic message (for immediate UI feedback)
  const addOptimisticMessage = useCallback((content: string) => {
    if (!phoneNumber) return;
    
    const newMessage: WhatsappMessage = {
      id: `optimistic-${Date.now()}`,
      chatId: phoneNumber,
      direction: "outbound",
      type: "text",
      content,
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, [phoneNumber]);

  return {
    messages,
    isLoading,
    error,
    refetch: fetchMessages,
    addOptimisticMessage,
  };
}
