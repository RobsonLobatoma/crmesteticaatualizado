export interface GlobalBiKpiSummary {
  monthRevenue: number;
  newLeads: number;
  conversionRate: number;
  npsScore: number;
}

export interface BiSeriesPoint {
  month: string;
  leads: number;
  revenue: number;
}
