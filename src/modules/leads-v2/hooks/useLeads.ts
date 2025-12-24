import { useState, useEffect } from 'react';
import { Lead, CreateLeadDTO, UpdateLeadDTO } from '../types/Lead';
import { leadsService } from '../services/leads.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/integrations/supabase/AuthProvider';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadLeads = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getAll(user.id);
      setLeads(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar leads';
      setError(message);
      toast({
        title: 'Erro ao carregar leads',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const ensureUser = () => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }
    return user.id;
  };

  const createLead = async (dto: CreateLeadDTO) => {
    try {
      const userId = ensureUser();
      const newLead = await leadsService.create(dto, userId);
      setLeads((prev) => [newLead, ...prev]);

      toast({
        title: 'Lead criado',
        description: `${newLead.nome} foi adicionado com sucesso.`,
      });

      return newLead;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar lead';
      toast({
        title: 'Erro ao criar lead',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateLead = async (dto: UpdateLeadDTO) => {
    try {
      const userId = ensureUser();
      const updated = await leadsService.update(dto, userId);
      setLeads((prev) => prev.map((lead) => (lead.id === dto.id ? updated : lead)));

      toast({
        title: 'Lead atualizado',
        description: `${updated.nome} foi atualizado com sucesso.`,
      });

      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar lead';
      toast({
        title: 'Erro ao atualizar lead',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    const lead = leads.find((l) => l.id === id);

    try {
      const userId = ensureUser();
      await leadsService.delete(id, userId);
      setLeads((prev) => prev.filter((l) => l.id !== id));

      toast({
        title: 'Lead removido',
        description: lead ? `${lead.nome} foi removido.` : 'Lead removido com sucesso.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar lead';
      toast({
        title: 'Erro ao deletar lead',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    leads,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    refresh: loadLeads,
  };
};
