export interface MarketingKpiSummary {
  activeCampaigns: number;
  reachedContacts: number;
  responseRate: number;
}

export interface ChannelPerformanceRow {
  id: string;
  channel: string;
  sent: number;
  responses: number;
  revenue: number;
}

export interface NpsResponse {
  id: string;
  date: string;
  score: number;
  comment?: string;
}
