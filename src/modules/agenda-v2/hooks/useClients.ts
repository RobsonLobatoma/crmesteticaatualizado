import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "../types";
import { toast } from "sonner";

export function useClients(searchTerm?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: async (): Promise<Client[]> => {
      let queryBuilder = supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (searchTerm && searchTerm.length > 0) {
        queryBuilder = queryBuilder.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (client: Pick<Client, "name" | "phone" | "email" | "cpf" | "birth_date">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("clients")
        .insert({ ...client, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente cadastrado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  return {
    clients: query.data ?? [],
    isLoading: query.isLoading,
    createClient: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
