import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  cpf: string | null;
  birth_date: string | null;
  address: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  valor_fechado?: number | null;
  data_fechamento?: string | null;
}

const formatAddress = (lead: any): string | null => {
  const parts = [
    lead.endereco,
    lead.numero,
    lead.bairro,
    lead.cidade,
    lead.estado,
    lead.cep
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

export const useClients = () => {
  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['clients-fechou'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'Fechou')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Mapear leads para interface Client
      return (data || []).map(lead => ({
        id: lead.id,
        name: lead.nome,
        phone: lead.contato,
        email: null,
        cpf: lead.cpf,
        birth_date: lead.data_nascimento,
        address: formatAddress(lead),
        notes: lead.observacao,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        valor_fechado: lead.valor_fechado ? parseFloat(lead.valor_fechado) : null,
        data_fechamento: lead.data_fechamento,
      } as Client));
    },
  });

  return { clients, isLoading, refetch };
};
