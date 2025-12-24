import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Professional } from "../types";
import { toast } from "sonner";

export function useProfessionals() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["professionals"],
    queryFn: async (): Promise<Professional[]> => {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (professional: Pick<Professional, "name" | "role" | "color">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("professionals")
        .insert({ ...professional, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast.success("Profissional criado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  return {
    professionals: query.data ?? [],
    isLoading: query.isLoading,
    createProfessional: createMutation.mutate,
  };
}
