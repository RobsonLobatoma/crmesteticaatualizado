export interface CampaignCard {
  id: string;
  title: string;
  description?: string;
  date?: string; // ISO string (yyyy-MM-dd ou completa)
}

export interface CampaignColumn {
  id: string;
  month: string;
  campaigns: CampaignCard[];
}
