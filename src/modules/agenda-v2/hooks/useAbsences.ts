import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfessionalAbsence, AbsenceFormData } from "../types";
import { toast } from "sonner";

export function useAbsences(professionalId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["absences", professionalId],
    queryFn: async (): Promise<ProfessionalAbsence[]> => {
      let queryBuilder = supabase
        .from("professional_absences")
        .select("*")
        .order("start_date", { ascending: true });

      if (professionalId) {
        queryBuilder = queryBuilder.eq("professional_id", professionalId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (absence: AbsenceFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("professional_absences")
        .insert({ ...absence, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast.success("Ausência registrada!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("professional_absences")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast.success("Ausência removida!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  return {
    absences: query.data ?? [],
    isLoading: query.isLoading,
    createAbsence: createMutation.mutate,
    deleteAbsence: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
