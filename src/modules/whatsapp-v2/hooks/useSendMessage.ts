import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EvolutionInstanceConfig } from "../types";

interface UseSendMessageOptions {
  instance: EvolutionInstanceConfig | null;
  onSuccess?: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:...;base64, prefix
      const base64 = result.split(",")[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useSendMessage({ instance, onSuccess }: UseSendMessageOptions) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (phoneNumber: string, message: string): Promise<boolean> => {
      if (!instance) {
        toast({ title: "Erro", description: "Nenhuma instância selecionada", variant: "destructive" });
        return false;
      }
      if (!phoneNumber || !message.trim()) {
        toast({ title: "Erro", description: "Número e mensagem são obrigatórios", variant: "destructive" });
        return false;
      }

      try {
        setIsSending(true);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) throw new Error("Não autenticado");

        const response = await supabase.functions.invoke("evolution-send-message", {
          body: {
            evolutionApiUrl: instance.evolutionApiUrl,
            evolutionApiKey: instance.evolutionApiKey,
            instanceName: instance.evolutionInstanceName,
            phoneNumber,
            message: message.trim(),
          },
        });

        if (response.error) throw new Error(response.error.message || "Erro ao enviar mensagem");
        if (response.data?.error) throw new Error(response.data.error);

        toast({ title: "Mensagem enviada", description: "Sua mensagem foi enviada com sucesso." });
        onSuccess?.();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        toast({ title: "Erro ao enviar", description: errorMessage, variant: "destructive" });
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [instance, toast, onSuccess]
  );

  const sendMedia = useCallback(
    async (phoneNumber: string, file: File, mediaType: string, caption?: string): Promise<boolean> => {
      if (!instance) {
        toast({ title: "Erro", description: "Nenhuma instância selecionada", variant: "destructive" });
        return false;
      }
      if (!phoneNumber || !file) {
        toast({ title: "Erro", description: "Número e arquivo são obrigatórios", variant: "destructive" });
        return false;
      }

      try {
        setIsSending(true);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) throw new Error("Não autenticado");

        const base64 = await fileToBase64(file);

        const response = await supabase.functions.invoke("evolution-send-media", {
          body: {
            evolutionApiUrl: instance.evolutionApiUrl,
            evolutionApiKey: instance.evolutionApiKey,
            instanceName: instance.evolutionInstanceName,
            phoneNumber,
            mediaType,
            base64,
            fileName: file.name,
            mimeType: file.type,
            caption: caption || undefined,
          },
        });

        if (response.error) throw new Error(response.error.message || "Erro ao enviar mídia");
        if (response.data?.error) throw new Error(response.data.error);

        toast({ title: "Mídia enviada", description: "Seu arquivo foi enviado com sucesso." });
        onSuccess?.();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        toast({ title: "Erro ao enviar mídia", description: errorMessage, variant: "destructive" });
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [instance, toast, onSuccess]
  );

  return {
    sendMessage,
    sendMedia,
    isSending,
  };
}
