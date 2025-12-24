import { useMemo } from 'react';
import { Lead } from '../types/Lead';

export const useLeadMetrics = (leads: Lead[]) => {
  const metrics = useMemo(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    
    // Leads cadastrados hoje
    const leadsHoje = leads.filter(lead => lead.dataEntrada === hoje).length;

    // Total de leads
    const totalLeads = leads.length;

    return {
      leadsHoje,
      totalLeads,
      taxaConversao: "34%",
      consultasConfirmadas: 12,
      avaliacoes: 6,
      retornos: 3,
      novosFechamentos: 3
    };
  }, [leads]);

  return metrics;
};
