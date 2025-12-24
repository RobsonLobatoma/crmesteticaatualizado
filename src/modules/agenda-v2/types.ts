export interface AgendaKpiSummary {
  scheduledToday: number;
  waitlist: number;
  noShowRate: number;
}

export interface AppointmentSlot {
  id: string;
  time: string;
  clientName: string;
  professional: string;
  room: string;
  status: "confirmado" | "em_confirmacao" | "no_show";
}

export interface WaitlistItem {
  id: string;
  clientName: string;
  procedure: string;
  priority: "alta" | "media" | "baixa";
  origin: string;
}

export interface NoShowRecord {
  id: string;
  clientName: string;
  date: string;
  reason: string;
  rescheduled: boolean;
}
