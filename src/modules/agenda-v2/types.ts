import { Tables } from "@/integrations/supabase/types";

// Database types
export type Appointment = Tables<"appointments">;
export type Client = Tables<"clients">;
export type Professional = Tables<"professionals">;
export type Room = Tables<"rooms">;
export type Equipment = Tables<"equipments">;
export type Service = Tables<"services">;
export type ProfessionalAbsence = Tables<"professional_absences">;
export type AppointmentSale = Tables<"appointment_sales">;

// Extended types for UI
export interface AppointmentWithRelations extends Appointment {
  client?: Client | null;
  professional?: Professional | null;
  room?: Room | null;
  equipment?: Equipment | null;
  service?: Service | null;
}

// View modes
export type CalendarView = "day" | "week" | "month";

// Form types
export interface AppointmentFormData {
  client_id: string;
  service_id: string;
  professional_id: string;
  room_id?: string;
  equipment_id?: string;
  start_datetime: string;
  duration_minutes: number;
  notes?: string;
  recurrence_type: "none" | "daily" | "weekly" | "biweekly" | "monthly";
  status: "agendado" | "confirmado" | "em_atendimento" | "concluido" | "cancelado" | "no_show";
  send_sms: boolean;
}

export interface AbsenceFormData {
  professional_id: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  absence_type: "day" | "period";
  reason?: string;
}

// Time slot for calendar grid
export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

// KPIs
export interface AgendaKpis {
  scheduledToday: number;
  confirmedToday: number;
  noShowRate: number;
}
