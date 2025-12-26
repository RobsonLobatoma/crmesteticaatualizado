import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CRMResponsible {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export type CRMResponsibleInsert = Omit<CRMResponsible, 'id' | 'created_at'>;
export type CRMResponsibleUpdate = Partial<Omit<CRMResponsible, 'id' | 'user_id' | 'created_at'>>;

export function useCRMResponsibles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: responsibles = [], isLoading, error } = useQuery({
    queryKey: ['crm-responsibles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_responsibles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as CRMResponsible[];
    },
  });

  const createResponsible = useMutation({
    mutationFn: async (responsible: CRMResponsibleInsert) => {
      const { data, error } = await supabase
        .from('crm_responsibles')
        .insert(responsible)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-responsibles'] });
      toast({ title: 'Responsável criado', description: 'O responsável foi criado com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar responsável', description: error.message, variant: 'destructive' });
    },
  });

  const updateResponsible = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & CRMResponsibleUpdate) => {
      const { data, error } = await supabase
        .from('crm_responsibles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-responsibles'] });
      toast({ title: 'Responsável atualizado', description: 'O responsável foi atualizado com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar responsável', description: error.message, variant: 'destructive' });
    },
  });

  const deleteResponsible = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_responsibles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-responsibles'] });
      toast({ title: 'Responsável excluído', description: 'O responsável foi excluído com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir responsável', description: error.message, variant: 'destructive' });
    },
  });

  return {
    responsibles,
    isLoading,
    error,
    createResponsible,
    updateResponsible,
    deleteResponsible,
  };
}
