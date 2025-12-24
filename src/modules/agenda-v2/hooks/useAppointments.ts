import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentWithRelations } from "../types";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

export function useAppointments(date: Date, view: "day" | "week" | "month" = "day") {
  const queryClient = useQueryClient();

  const getDateRange = () => {
    switch (view) {
      case "week":
        return { start: startOfWeek(date, { weekStartsOn: 0 }), end: endOfWeek(date, { weekStartsOn: 0 }) };
      case "month":
        return { start: startOfMonth(date), end: endOfMonth(date) };
      default:
        return { start: startOfDay(date), end: endOfDay(date) };
    }
  };

  const { start, end } = getDateRange();

  const query = useQuery({
    queryKey: ["appointments", format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd")],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          room:rooms(*),
          equipment:equipments(*),
          service:services(*)
        `)
        .gte("start_datetime", start.toISOString())
        .lte("start_datetime", end.toISOString())
        .order("start_datetime", { ascending: true });

      if (error) throw error;
      return data as AppointmentWithRelations[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (appointment: Omit<Appointment, "id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("appointments")
        .insert({ ...appointment, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar agendamento: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  return {
    appointments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createAppointment: createMutation.mutate,
    updateAppointment: updateMutation.mutate,
    deleteAppointment: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
