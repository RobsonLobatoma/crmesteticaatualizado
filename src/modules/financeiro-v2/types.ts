export interface DailyFinancePoint {
  date: string;
  revenue: number;
  expenses: number;
}

export interface FinanceKpiSummary {
  monthRevenue: number;
  openReceivables: number;
  openPayables: number;
  estimatedMargin: number;
}

export type FinanceEntryType = "pagar" | "receber";

export interface FinanceEntry {
  id: string;
  type: FinanceEntryType;
  description: string;
  category: string;
  dueDate: string;
  value: number;
  status: "aberta" | "paga" | "recebida" | "atrasada";
}

export interface CommissionRow {
  id: string;
  professional: string;
  produced: number;
  commissionPercent: number;
}
