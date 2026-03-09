import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CRMHistoryEvent {
  id: string;
  user_id: string;
  lead_id: string | null;
  crm_client_id: string | null;
  tipo: string;
  descricao: string;
  usuario: string;
  detalhes: Record<string, any>;
  created_at: string;
}

export function useCRMHistory(crm_client_id?: string, lead_id?: string) {
  const queryClient = useQueryClient();

  const queryKey = ['crm-history', crm_client_id, lead_id];

  const { data: history = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('crm_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (crm_client_id) {
        query = query.eq('crm_client_id', crm_client_id);
      } else if (lead_id) {
        query = query.eq('lead_id', lead_id);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRMHistoryEvent[];
    },
    enabled: !!(crm_client_id || lead_id),
  });

  const addEvent = useMutation({
    mutationFn: async (event: {
      lead_id?: string | null;
      crm_client_id?: string | null;
      tipo: string;
      descricao: string;
      usuario?: string;
      detalhes?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('crm_history')
        .insert({
          user_id: user.id,
          lead_id: event.lead_id || null,
          crm_client_id: event.crm_client_id || null,
          tipo: event.tipo,
          descricao: event.descricao,
          usuario: event.usuario || 'Sistema',
          detalhes: event.detalhes || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { history, isLoading, addEvent };
}
