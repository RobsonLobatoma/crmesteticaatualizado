import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CRMStatus {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type CRMStatusInsert = Omit<CRMStatus, 'id' | 'created_at'>;
export type CRMStatusUpdate = Partial<Omit<CRMStatus, 'id' | 'user_id' | 'created_at'>>;

export function useCRMStatuses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: statuses = [], isLoading, error } = useQuery({
    queryKey: ['crm-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_statuses')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as CRMStatus[];
    },
  });

  const createStatus = useMutation({
    mutationFn: async (status: CRMStatusInsert) => {
      const { data, error } = await supabase
        .from('crm_statuses')
        .insert(status)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-statuses'] });
      toast({ title: 'Status criado', description: 'O status foi criado com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar status', description: error.message, variant: 'destructive' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & CRMStatusUpdate) => {
      const { data, error } = await supabase
        .from('crm_statuses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-statuses'] });
      toast({ title: 'Status atualizado', description: 'O status foi atualizado com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    },
  });

  const deleteStatus = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_statuses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-statuses'] });
      toast({ title: 'Status excluído', description: 'O status foi excluído com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir status', description: error.message, variant: 'destructive' });
    },
  });

  return {
    statuses,
    isLoading,
    error,
    createStatus,
    updateStatus,
    deleteStatus,
  };
}
