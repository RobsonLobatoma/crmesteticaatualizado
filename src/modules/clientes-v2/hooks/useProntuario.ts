import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProntuarioRecord {
  id: string;
  user_id: string;
  lead_id: string | null;
  tipo: string;
  titulo: string;
  conteudo: string | null;
  profissional: string | null;
  created_at: string;
  updated_at: string;
}

export function useProntuario(leadId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['prontuario', leadId];

  const { data: records = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!leadId) return [];
      const { data, error } = await supabase
        .from('prontuario')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProntuarioRecord[];
    },
    enabled: !!leadId,
  });

  const addRecord = useMutation({
    mutationFn: async (record: { lead_id: string; tipo: string; titulo: string; conteudo?: string; profissional?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('prontuario')
        .insert({ ...record, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; titulo?: string; conteudo?: string; profissional?: string; tipo?: string }) => {
      const { data, error } = await supabase
        .from('prontuario')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prontuario').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { records, isLoading, addRecord, updateRecord, deleteRecord };
}
