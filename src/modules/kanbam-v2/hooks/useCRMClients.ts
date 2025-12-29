import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CRMClient {
  id: string;
  user_id: string;
  lead_id: string | null;
  nome: string;
  telefone: string;
  email: string | null;
  status: string;
  responsavel: string | null;
  origem: string | null;
  ultima_mensagem: string | null;
  horario_ultima_mensagem: string | null;
  data_criacao: string;
  ultima_interacao: string;
  tags: string[];
  observacoes: string | null;
  total_mensagens: number;
  mensagens_nao_lidas: number;
  urgente: boolean;
  created_at: string;
  updated_at: string;
}

export type CRMClientInsert = Omit<CRMClient, 'id' | 'created_at' | 'updated_at' | 'data_criacao' | 'ultima_interacao'> & {
  data_criacao?: string;
  ultima_interacao?: string;
};

export type CRMClientUpdate = Partial<Omit<CRMClient, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export function useCRMClients() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['crm-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('*')
        .order('ultima_interacao', { ascending: false });

      if (error) throw error;
      return data as CRMClient[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (client: CRMClientInsert) => {
      const { data, error } = await supabase
        .from('crm_clients')
        .insert(client)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
      toast({ title: 'Cliente adicionado ao Kanban', description: 'O cliente foi adicionado com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar cliente', description: error.message, variant: 'destructive' });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & CRMClientUpdate) => {
      const { data, error } = await supabase
        .from('crm_clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar cliente', description: error.message, variant: 'destructive' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('crm_clients')
        .update({ status, ultima_interacao: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
      toast({ title: 'Cliente removido', description: 'O cliente foi removido do Kanban.' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover cliente', description: error.message, variant: 'destructive' });
    },
  });

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    updateStatus,
    deleteClient,
  };
}
