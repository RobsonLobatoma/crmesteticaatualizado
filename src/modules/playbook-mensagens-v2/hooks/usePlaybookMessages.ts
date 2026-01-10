import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/AuthProvider";
import { toast } from "sonner";
import type { PlaybookCategory, PlaybookMessage } from "../types/Playbook";
import {
  protocoloData,
  sondagemData,
  fechamentoData,
  objecoesData,
  depoimentosData,
} from "../data/playbook.mock";

export function usePlaybookMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["playbook-messages", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("playbook_messages")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching playbook messages:", error);
        throw error;
      }

      return (data || []) as PlaybookMessage[];
    },
    enabled: !!user?.id,
  });

  // Helper to get messages by category
  const getByCategory = (category: PlaybookCategory) => {
    return messages.filter((m) => m.category === category);
  };

  // Check if user has any messages
  const hasUserMessages = messages.length > 0;

  // Get merged data (user data takes priority, fallback to mock)
  const getProtocoloData = () => {
    const userMessages = getByCategory("protocolo");
    if (userMessages.length > 0) {
      return userMessages.map((m) => ({
        id: m.id,
        etapa: m.etapa || "",
        objetivo: m.objetivo || "",
        script: m.script || "",
      }));
    }
    return protocoloData;
  };

  const getSondagemData = () => {
    const userMessages = getByCategory("sondagem");
    if (userMessages.length > 0) {
      return userMessages.map((m) => ({
        id: m.id,
        categoria: m.categoria || "",
        pergunta: m.pergunta || "",
        objetivo: m.objetivo || "",
      }));
    }
    return sondagemData;
  };

  const getFechamentoData = () => {
    const userMessages = getByCategory("fechamento");
    if (userMessages.length > 0) {
      return userMessages.map((m) => ({
        id: m.id,
        acao: m.acao || "",
        script: m.script || "",
        observacao: m.observacao || "",
      }));
    }
    return fechamentoData;
  };

  const getObjecoesData = () => {
    const userMessages = getByCategory("objecoes");
    if (userMessages.length > 0) {
      return userMessages.map((m) => ({
        id: m.id,
        categoria: m.categoria || "",
        objecaoComum: m.objecao_comum || "",
        estrategia: m.estrategia || "",
        scriptExemplo: m.script_exemplo || "",
      }));
    }
    return objecoesData;
  };

  const getDepoimentosData = () => {
    const userMessages = getByCategory("depoimentos");
    if (userMessages.length > 0) {
      return userMessages.map((m) => ({
        id: m.id,
        objecao: m.objecao || "",
        depoimento: m.depoimento || "",
      }));
    }
    return depoimentosData;
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<PlaybookMessage> & { category: PlaybookCategory }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const maxOrder = messages
        .filter((m) => m.category === data.category)
        .reduce((max, m) => Math.max(max, m.display_order), -1);

      const insertData = {
        category: data.category,
        etapa: data.etapa,
        objetivo: data.objetivo,
        script: data.script,
        categoria: data.categoria,
        pergunta: data.pergunta,
        acao: data.acao,
        observacao: data.observacao,
        objecao_comum: data.objecao_comum,
        estrategia: data.estrategia,
        script_exemplo: data.script_exemplo,
        objecao: data.objecao,
        depoimento: data.depoimento,
        user_id: user.id,
        display_order: maxOrder + 1,
      };

      const { data: newMessage, error } = await supabase
        .from("playbook_messages")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook-messages"] });
      toast.success("Mensagem adicionada com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating message:", error);
      toast.error("Erro ao adicionar mensagem");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<PlaybookMessage> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from("playbook_messages")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook-messages"] });
      toast.success("Mensagem atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating message:", error);
      toast.error("Erro ao atualizar mensagem");
    },
  });

  // Delete mutation (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("playbook_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook-messages"] });
      toast.success("Mensagem removida com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting message:", error);
      toast.error("Erro ao remover mensagem");
    },
  });

  // Seed from mock data
  const seedFromMock = useMutation({
    mutationFn: async (category: PlaybookCategory) => {
      if (!user?.id) throw new Error("User not authenticated");

      let mockData: Partial<PlaybookMessage>[] = [];

      switch (category) {
        case "protocolo":
          mockData = protocoloData.map((item, index) => ({
            category: "protocolo" as const,
            etapa: item.etapa,
            objetivo: item.objetivo,
            script: item.script,
            display_order: index,
          }));
          break;
        case "sondagem":
          mockData = sondagemData.map((item, index) => ({
            category: "sondagem" as const,
            categoria: item.categoria,
            pergunta: item.pergunta,
            objetivo: item.objetivo,
            display_order: index,
          }));
          break;
        case "fechamento":
          mockData = fechamentoData.map((item, index) => ({
            category: "fechamento" as const,
            acao: item.acao,
            script: item.script,
            observacao: item.observacao,
            display_order: index,
          }));
          break;
        case "objecoes":
          mockData = objecoesData.map((item, index) => ({
            category: "objecoes" as const,
            categoria: item.categoria,
            objecao_comum: item.objecaoComum,
            estrategia: item.estrategia,
            script_exemplo: item.scriptExemplo,
            display_order: index,
          }));
          break;
        case "depoimentos":
          mockData = depoimentosData.map((item, index) => ({
            category: "depoimentos" as const,
            objecao: item.objecao,
            depoimento: item.depoimento,
            display_order: index,
          }));
          break;
      }

      const insertData = mockData.map((item) => ({
        category: item.category!,
        etapa: item.etapa,
        objetivo: item.objetivo,
        script: item.script,
        categoria: item.categoria,
        pergunta: item.pergunta,
        acao: item.acao,
        observacao: item.observacao,
        objecao_comum: item.objecao_comum,
        estrategia: item.estrategia,
        script_exemplo: item.script_exemplo,
        objecao: item.objecao,
        depoimento: item.depoimento,
        display_order: item.display_order,
        user_id: user.id,
      }));

      const { error } = await supabase.from("playbook_messages").insert(insertData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook-messages"] });
      toast.success("Mensagens padrão carregadas!");
    },
    onError: (error) => {
      console.error("Error seeding messages:", error);
      toast.error("Erro ao carregar mensagens padrão");
    },
  });

  return {
    messages,
    isLoading,
    hasUserMessages,
    getProtocoloData,
    getSondagemData,
    getFechamentoData,
    getObjecoesData,
    getDepoimentosData,
    getByCategory,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    seedFromMock: seedFromMock.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSeeding: seedFromMock.isPending,
  };
}
