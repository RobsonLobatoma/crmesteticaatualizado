import {
  AgendaKpiSummary,
  AppointmentSlot,
  NoShowRecord,
  WaitlistItem,
} from "./types";

export const AGENDA_KPIS: AgendaKpiSummary = {
  scheduledToday: 0,
  waitlist: 0,
  noShowRate: 0,
};

export const AGENDA_DAY_SLOTS: AppointmentSlot[] = [];

export const AGENDA_WAITLIST: WaitlistItem[] = [];

export const AGENDA_NO_SHOWS: NoShowRecord[] = [];
