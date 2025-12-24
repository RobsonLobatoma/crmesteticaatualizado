import {
  CommercialDailyVolumePoint,
  CommercialKpiSummary,
  CommercialProposal,
  CommercialStage,
} from "./types";

export const COMMERCIAL_KPIS: CommercialKpiSummary = {
  openProposals: 0,
  conversionRate: 0,
  averageTicket: 0,
  openPotential: 0,
};

export const COMMERCIAL_STAGES: CommercialStage[] = [
  { id: "novo", name: "Novo", color: "var(--chart-1)" },
  { id: "em_negociacao", name: "Em negociação", color: "var(--chart-2)" },
  { id: "proposta_enviada", name: "Proposta enviada", color: "var(--chart-3)" },
  { id: "fechou", name: "Fechou", color: "var(--chart-4)" },
  { id: "nao_fechou", name: "Não fechou", color: "var(--chart-5)" },
];

export const COMMERCIAL_DAILY_VOLUME: CommercialDailyVolumePoint[] = [];

export const COMMERCIAL_PROPOSALS: CommercialProposal[] = [];
