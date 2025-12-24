export interface ClientSummary {
  id: string;
  name: string;
  age: number;
  city: string;
  phone: string;
  lastVisit: string;
  sessionsCount: number;
  averageTicket: number;
}

export interface VisitRecord {
  id: string;
  clientId: string;
  date: string;
  professional: string;
  procedure: string;
  status: "realizado" | "cancelado" | "no_show";
}
