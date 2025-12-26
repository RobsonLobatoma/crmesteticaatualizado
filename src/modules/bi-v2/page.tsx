import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BI_KPIS } from "./mock";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useLeads } from "@/modules/leads-v2/hooks/useLeads";
import { Lead } from "@/modules/leads-v2/types/Lead";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const parseDateFlexible = (value?: string | null): Date | null => {
  if (!value) return null;

  if (value.includes("-")) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value.includes("/")) {
    const [day, month, year] = value.split("/").map(Number);
    if (!day || !month || !year) return null;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const getMonthKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
};

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const isSameMonthAndYear = (date: Date, reference: Date) => {
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
};

const sanitizeCurrencyToNumber = (value?: string | null): number => {
  if (!value) return 0;
  const numeric = Number(
    value
      .replace(/[^0-9,-]/g, "")
      .replace(".", "")
      .replace(",", "."),
  );
  return Number.isNaN(numeric) ? 0 : numeric;
};

const BiV2Page = () => {
  const { leads } = useLeads();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const referenceDate = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedYear, selectedMonth],
  );

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (leads || []).forEach((lead: Lead) => {
      const date =
        parseDateFlexible(lead.dataEntrada) ||
        parseDateFlexible(lead.dataFechamento);
      if (date) {
        years.add(date.getFullYear());
      }
    });
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    return Array.from(years).sort((a, b) => a - b);
  }, [leads]);

  const {
    revenueLeadsByMonth,
    leadsByOrigin,
    leadsByResponsavel,
    leadsByStatus,
    kpiMonthRevenue,
    kpiNewLeads,
    kpiConversionRate,
    performanceByResponsavel,
  } = useMemo(() => {
    const revenueLeadsMap = new Map<string, { revenue: number; leads: number }>();
    const originMap = new Map<string, number>();
    const responsavelMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    const performanceMap = new Map<
      string,
      { responsavel: string; recebidos: number; atendidos: number; fechados: number; taxaConversao: number }
    >();

    let monthRevenue = 0;
    let monthNewLeads = 0;
    let monthClosedLeads = 0;

    (leads || []).forEach((lead: Lead) => {
      const dataEntrada = parseDateFlexible(lead.dataEntrada);
      const dataFechamento = parseDateFlexible(lead.dataFechamento);
      const dataUltimoContato = parseDateFlexible(lead.dataUltimoContato);

      const responsavel = (lead.responsavel || "Sem responsável").trim() || "Sem responsável";

      if (dataEntrada) {
        const key = getMonthKey(dataEntrada);
        const current = revenueLeadsMap.get(key) || { revenue: 0, leads: 0 };
        revenueLeadsMap.set(key, { ...current, leads: current.leads + 1 });

        if (isSameMonthAndYear(dataEntrada, referenceDate)) {
          monthNewLeads += 1;

          const origem = (lead.origem || "Sem origem").trim() || "Sem origem";
          originMap.set(origem, (originMap.get(origem) || 0) + 1);

          const status = (lead.status || "Sem status").trim() || "Sem status";
          statusMap.set(status, (statusMap.get(status) || 0) + 1);

          const perf =
            performanceMap.get(responsavel) ||
            ({ responsavel, recebidos: 0, atendidos: 0, fechados: 0, taxaConversao: 0 } as const);
          performanceMap.set(responsavel, {
            ...perf,
            recebidos: perf.recebidos + 1,
          });
        }
      }

      if (dataUltimoContato && isSameMonthAndYear(dataUltimoContato, referenceDate)) {
        const perf =
          performanceMap.get(responsavel) ||
          ({ responsavel, recebidos: 0, atendidos: 0, fechados: 0, taxaConversao: 0 } as const);
        performanceMap.set(responsavel, {
          ...perf,
          atendidos: perf.atendidos + 1,
        });
      }

      if (dataFechamento && lead.valorFechado) {
        const key = getMonthKey(dataFechamento);
        const current = revenueLeadsMap.get(key) || { revenue: 0, leads: 0 };
        const valor = sanitizeCurrencyToNumber(lead.valorFechado);
        revenueLeadsMap.set(key, {
          ...current,
          revenue: current.revenue + valor,
        });

        if (isSameMonthAndYear(dataFechamento, referenceDate)) {
          monthRevenue += valor;
          monthClosedLeads += 1;

          const origem = (lead.origem || "Sem origem").trim() || "Sem origem";
          originMap.set(origem, (originMap.get(origem) || 0) + 1);

          const status = (lead.status || "Sem status").trim() || "Sem status";
          statusMap.set(status, (statusMap.get(status) || 0) + 1);

          const perf =
            performanceMap.get(responsavel) ||
            ({ responsavel, recebidos: 0, atendidos: 0, fechados: 0, taxaConversao: 0 } as const);
          performanceMap.set(responsavel, {
            ...perf,
            fechados: perf.fechados + 1,
          });
        }
      }
    });

    const selectedKey = getMonthKey(referenceDate);

    const revenueLeadsByMonth = Array.from(revenueLeadsMap.entries())
      .filter(([key]) => key === selectedKey)
      .sort((a, b) => {
        const [monthA, yearA] = a[0].split("/").map(Number);
        const [monthB, yearB] = b[0].split("/").map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      })
      .map(([month, values]) => ({
        month,
        revenue: values.revenue,
        leads: values.leads,
      }));

    const leadsByOrigin = Array.from(originMap.entries()).map(([origin, count]) => ({
      label: origin,
      value: count,
    }));

    const leadsByResponsavel = Array.from(performanceMap.values()).map((item) => ({
      label: item.responsavel,
      value: item.recebidos,
    }));

    const leadsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      label: status,
      value: count,
    }));

    const kpiConversionRate = monthNewLeads > 0 ? Number(((monthClosedLeads / monthNewLeads) * 100).toFixed(1)) : 0;

    const performanceByResponsavel = Array.from(performanceMap.values()).map((item) => ({
      ...item,
      taxaConversao:
        item.recebidos > 0 ? Number(((item.fechados / item.recebidos) * 100).toFixed(1)) : 0,
    }));

    return {
      revenueLeadsByMonth,
      leadsByOrigin,
      leadsByResponsavel,
      leadsByStatus,
      kpiMonthRevenue: monthRevenue,
      kpiNewLeads: monthNewLeads,
      kpiConversionRate,
      performanceByResponsavel,
    };
  }, [leads, referenceDate]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios, BI &amp; Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Hub de dashboards estratégicos, previsões e configurações avançadas do SaaS.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-muted-foreground">Período:</span>
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="h-8 w-[150px] border-border/70 bg-background text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((label, index) => (
                <SelectItem key={label} value={String(index)} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="h-8 w-[110px] border-border/70 bg-background text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)} className="text-xs">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Faturamento do mês"
          value={kpiMonthRevenue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard label="Novos leads" value={kpiNewLeads} />
        <KpiCard label="Taxa de conversão" value={`${kpiConversionRate}%`} />
        <KpiCard label="NPS" value={BI_KPIS.npsScore} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faturamento x Leads por mês</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                revenue: { label: "Receita", color: "hsl(var(--primary))" },
                leads: { label: "Leads", color: "hsl(var(--accent))" },
              }}
              className="h-full"
            >
              <BarChart data={revenueLeadsByMonth}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atalhos estratégicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Esta área consolida os principais KPIs de Leads, Comercial, Financeiro, Agenda e NPS em uma visão única
              para o dono da clínica.
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Ver detalhes do funil em Comercial &amp; Vendas</li>
              <li>Abrir visão financeira completa em Financeiro &amp; Faturamento</li>
              <li>Aprofundar pacientes e histórico em Clientes &amp; Clínico</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads por origem</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                leads: { label: "Leads", color: "hsl(var(--primary))" },
              }}
              className="h-full"
            >
              <BarChart data={leadsByOrigin}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads por responsável</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                leads: { label: "Leads", color: "hsl(var(--accent))" },
              }}
              className="h-full"
            >
              <BarChart data={leadsByResponsavel}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads por status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                leads: { label: "Leads", color: "hsl(var(--primary))" },
              }}
              className="h-full"
            >
              <BarChart data={leadsByStatus}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance por responsável (mês atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-border/60 text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-2 text-left font-medium">Responsável</th>
                    <th className="py-2 px-2 text-right font-medium">Recebidos</th>
                    <th className="py-2 px-2 text-right font-medium">Atendidos</th>
                    <th className="py-2 px-2 text-right font-medium">Fechados</th>
                    <th className="py-2 pl-2 text-right font-medium">Taxa conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceByResponsavel.length === 0 ? (
                    <tr>
                      <td className="py-4 text-center text-muted-foreground" colSpan={5}>
                        Ainda não há dados de performance para o mês atual.
                      </td>
                    </tr>
                  ) : (
                    performanceByResponsavel.map((item) => (
                      <tr key={item.responsavel} className="border-b border-border/40 last:border-0">
                        <td className="py-2 pr-2 text-left align-middle text-xs font-medium">
                          {item.responsavel}
                        </td>
                        <td className="py-2 px-2 text-right align-middle tabular-nums">{item.recebidos}</td>
                        <td className="py-2 px-2 text-right align-middle tabular-nums">{item.atendidos}</td>
                        <td className="py-2 px-2 text-right align-middle tabular-nums">{item.fechados}</td>
                        <td className="py-2 pl-2 text-right align-middle tabular-nums">
                          {item.taxaConversao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default BiV2Page;
