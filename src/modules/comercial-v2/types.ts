export type CommercialStageId =
  | "novo"
  | "em_negociacao"
  | "proposta_enviada"
  | "fechou"
  | "nao_fechou";

export interface CommercialKpiSummary {
  openProposals: number;
  conversionRate: number;
  averageTicket: number;
  openPotential: number;
}

export interface CommercialProposal {
  id: string;
  clientName: string;
  treatment: string;
  value: number;
  status: "aberta" | "fechada_ganha" | "fechada_perdida";
  createdAt: string;
  source: string;
  stageId: CommercialStageId;
}

export interface CommercialStage {
  id: CommercialStageId;
  name: string;
  color: string;
}

export interface CommercialDailyVolumePoint {
  date: string;
  proposals: number;
}
