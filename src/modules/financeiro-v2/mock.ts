import {
  CommissionRow,
  DailyFinancePoint,
  FinanceEntry,
  FinanceKpiSummary,
} from "./types";

export const FINANCE_KPIS: FinanceKpiSummary = {
  monthRevenue: 0,
  openReceivables: 0,
  openPayables: 0,
  estimatedMargin: 0,
};

export const FINANCE_DAILY_SERIES: DailyFinancePoint[] = [];

export const FINANCE_ENTRIES: FinanceEntry[] = [];

export const FINANCE_COMMISSIONS: CommissionRow[] = [];
