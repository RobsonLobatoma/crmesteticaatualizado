import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FINANCE_COMMISSIONS, FINANCE_DAILY_SERIES, FINANCE_ENTRIES, FINANCE_KPIS } from "./mock";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusPill } from "@/components/dashboard/StatusPill";

const FinanceiroV2Page = () => {
  const [typeFilter, setTypeFilter] = useState<"todos" | "pagar" | "receber">("todos");

  const filteredEntries = useMemo(
    () =>
      typeFilter === "todos"
        ? FINANCE_ENTRIES
        : FINANCE_ENTRIES.filter((entry) => entry.type === typeFilter),
    [typeFilter]
  );

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro &amp; Faturamento</h1>
        <p className="text-sm text-muted-foreground">
          Visão financeira diária da clínica com foco em fluxo de caixa, DRE e previsibilidade.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Faturamento do mês"
          value={FINANCE_KPIS.monthRevenue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard
          label="Contas a receber em aberto"
          value={FINANCE_KPIS.openReceivables.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard
          label="Contas a pagar"
          value={FINANCE_KPIS.openPayables.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard label="Margem estimada" value={`${FINANCE_KPIS.estimatedMargin}%`} />
      </section>

      <Tabs defaultValue="overview" className="mt-2 flex-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="entries">Contas a pagar/receber</TabsTrigger>
          <TabsTrigger value="commissions">Comissionamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Faturamento x Despesas (últimos dias)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ChartContainer
                config={{
                  revenue: { label: "Receitas", color: "hsl(var(--primary))" },
                  expenses: { label: "Despesas", color: "hsl(var(--destructive))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FINANCE_DAILY_SERIES}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.substring(5)}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="mt-4">
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter("todos")}
              className={`rounded-full border px-3 py-1 ${
                typeFilter === "todos" ? "border-primary bg-primary/10" : "border-border/60 bg-background/40"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("receber")}
              className={`rounded-full border px-3 py-1 ${
                typeFilter === "receber" ? "border-primary bg-primary/10" : "border-border/60 bg-background/40"
              }`}
            >
              A receber
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("pagar")}
              className={`rounded-full border px-3 py-1 ${
                typeFilter === "pagar" ? "border-primary bg-primary/10" : "border-border/60 bg-background/40"
              }`}
            >
              A pagar
            </button>
          </div>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Contas a pagar/receber</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="text-sm">
                      <TableCell className="capitalize">{entry.type}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>{entry.dueDate}</TableCell>
                      <TableCell className="text-right">
                        {entry.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={entry.status}
                          tone={
                            entry.status === "paga" || entry.status === "recebida"
                              ? "success"
                              : entry.status === "atrasada"
                                ? "danger"
                                : "default"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Comissionamento por profissional</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="text-right">Produzido</TableHead>
                    <TableHead className="text-right">% Comissão</TableHead>
                    <TableHead className="text-right">Valor da comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FINANCE_COMMISSIONS.map((row) => {
                    const commissionValue = (row.produced * row.commissionPercent) / 100;
                    return (
                      <TableRow key={row.id} className="text-sm">
                        <TableCell>{row.professional}</TableCell>
                        <TableCell className="text-right">
                          {row.produced.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell className="text-right">{row.commissionPercent}%</TableCell>
                        <TableCell className="text-right">
                          {commissionValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceiroV2Page;

