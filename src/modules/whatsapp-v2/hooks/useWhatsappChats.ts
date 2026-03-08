import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { EvolutionInstanceConfig, WhatsappChat } from "../types";

interface UseWhatsappChatsOptions {
  instance: EvolutionInstanceConfig | null;
  enabled?: boolean;
  pollingInterval?: number;
}

async function syncNewContactsToKanban(chats: WhatsappChat[], userId: string) {
  if (chats.length === 0) return;

  const phoneNumbers = [...new Set(chats.map((c) => c.phoneNumber))];

  // Check which phones already exist in crm_clients
  const { data: existingClients } = await supabase
    .from("crm_clients")
    .select("telefone")
    .in("telefone", phoneNumbers);

  const existingPhones = new Set((existingClients || []).map((c) => c.telefone));
  const newContacts = chats.filter((c) => !existingPhones.has(c.phoneNumber));

  if (newContacts.length === 0) return;

  // Get first active crm_status slug
  const { data: statuses } = await supabase
    .from("crm_statuses")
    .select("slug, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const novoLeadStatus = statuses?.find(s => s.slug === 'novo_lead')
    || statuses?.find(s => s.name?.toLowerCase().includes('novo lead'))
    || statuses?.find(s => s.slug === 'novo_hoje' || s.slug === 'novo')
    || statuses?.[0];
  const defaultStatus = novoLeadStatus?.slug || "novo_lead";

  // Deduplicate by phone
  const seen = new Set<string>();
  const toInsert = newContacts
    .filter((c) => {
      if (seen.has(c.phoneNumber)) return false;
      seen.add(c.phoneNumber);
      return true;
    })
    .map((c) => ({
      nome: c.leadName || c.phoneNumber,
      telefone: c.phoneNumber,
      status: defaultStatus,
      origem: "WhatsApp",
      user_id: userId,
    }));

  await supabase.from("crm_clients").insert(toInsert);
}

export function useWhatsappChats({
  instance,
  enabled = true,
  pollingInterval = 30000,
}: UseWhatsappChatsOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [chats, setChats] = useState<WhatsappChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!instance || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Não autenticado");
      }

      const response = await supabase.functions.invoke("evolution-fetch-chats", {
        body: {
          evolutionApiUrl: instance.evolutionApiUrl,
          evolutionApiKey: instance.evolutionApiKey,
          instanceName: instance.evolutionInstanceName,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao buscar chats");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const fetchedChats: WhatsappChat[] = (response.data?.chats || []).map(
        (chat: {
          id: string;
          phoneNumber: string;
          leadName?: string;
          profilePictureUrl?: string;
          unreadCount?: number;
          lastMessagePreview?: string;
          lastMessageAt?: string;
        }) => ({
          id: chat.id,
          instanceId: instance.id,
          phoneNumber: chat.phoneNumber,
          leadName: chat.leadName,
          status: "novo" as const,
          lastMessagePreview: chat.lastMessagePreview || "",
          lastMessageAt: chat.lastMessageAt || new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
        })
      );

      setChats(fetchedChats);

      // Auto-sync new contacts to Kanban
      try {
        const userId = sessionData.session.user.id;
        await syncNewContactsToKanban(fetchedChats, userId);
        queryClient.invalidateQueries({ queryKey: ["crm-clients"] });
      } catch (syncErr) {
        console.error("Erro ao sincronizar contatos ao Kanban:", syncErr);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("Erro ao buscar chats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [instance, enabled, queryClient]);

  // Initial fetch
  useEffect(() => {
    if (instance && enabled) {
      fetchChats();
    } else {
      setChats([]);
    }
  }, [instance?.id, enabled, fetchChats]);

  // Polling
  useEffect(() => {
    if (!instance || !enabled || pollingInterval <= 0) return;

    const intervalId = setInterval(fetchChats, pollingInterval);
    return () => clearInterval(intervalId);
  }, [instance?.id, enabled, pollingInterval, fetchChats]);

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
  };
}
