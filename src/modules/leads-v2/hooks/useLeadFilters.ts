import { useMemo, useState } from 'react';
import { Lead } from '../types/Lead';

export interface LeadFilters {
  busca: string;
  status: string;
  responsavel: string;
  origem: string;
  dataInicio: string;
  dataFim: string;
}

export const useLeadFilters = (leads: Lead[]) => {
  const [filters, setFilters] = useState<LeadFilters>({
    busca: '',
    status: '',
    responsavel: '',
    origem: '',
    dataInicio: '',
    dataFim: ''
  });

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filters.busca) {
        const busca = filters.busca.toLowerCase();
        const matchNome = lead.nome.toLowerCase().includes(busca);
        const matchContato = lead.contato.toLowerCase().includes(busca);
        if (!matchNome && !matchContato) return false;
      }

      if (filters.status && lead.status !== filters.status) {
        return false;
      }

      if (filters.responsavel && lead.responsavel !== filters.responsavel) {
        return false;
      }

      if (filters.origem && lead.origem !== filters.origem) {
        return false;
      }

      if (filters.dataInicio) {
        const dataLead = new Date(lead.dataEntrada);
        const dataInicio = new Date(filters.dataInicio);
        if (dataLead < dataInicio) return false;
      }

      if (filters.dataFim) {
        const dataLead = new Date(lead.dataEntrada);
        const dataFim = new Date(filters.dataFim);
        dataFim.setHours(23, 59, 59, 999);
        if (dataLead > dataFim) return false;
      }

      return true;
    });
  }, [leads, filters]);

  const uniqueResponsaveis = useMemo(() => {
    return Array.from(new Set(leads.map(l => l.responsavel))).sort();
  }, [leads]);

  const uniqueOrigens = useMemo(() => {
    return Array.from(new Set(leads.map(l => l.origem))).sort();
  }, [leads]);

  const updateFilter = <K extends keyof LeadFilters>(
    key: K,
    value: LeadFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      busca: '',
      status: '',
      responsavel: '',
      origem: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  return {
    filters,
    filteredLeads,
    updateFilter,
    resetFilters,
    uniqueResponsaveis,
    uniqueOrigens,
    totalFiltered: filteredLeads.length,
    totalOriginal: leads.length
  };
};
