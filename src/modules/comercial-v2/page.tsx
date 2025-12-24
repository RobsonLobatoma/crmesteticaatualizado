import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { COMMERCIAL_DAILY_VOLUME, COMMERCIAL_KPIS, COMMERCIAL_PROPOSALS, COMMERCIAL_STAGES } from "./mock";
import type { CommercialStageId } from "./types";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { KpiCard } from "@/components/dashboard/KpiCard";

const ComercialV2Page = () => {
  const [selectedStage, setSelectedStage] = useState<CommercialStageId | "todos">("todos");

  const filteredProposals = useMemo(
    () =>
      selectedStage === "todos"
        ? COMMERCIAL_PROPOSALS
        : COMMERCIAL_PROPOSALS.filter((p) => p.stageId === selectedStage),
    [selectedStage]
  );

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Comercial &amp; Vendas</h1>
        <p className="text-sm text-muted-foreground">
          Visão estratégica do funil comercial, propostas e conversões da clínica.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Propostas abertas" value={COMMERCIAL_KPIS.openProposals} />
        <KpiCard label="Conversão últimos 30 dias" value={`${COMMERCIAL_KPIS.conversionRate}%`} />
        <KpiCard
          label="Ticket médio proposto"
          value={COMMERCIAL_KPIS.averageTicket.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard
          label="Potencial em aberto"
          value={COMMERCIAL_KPIS.openPotential.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        />
      </section>

      <Tabs defaultValue="overview" className="mt-2 flex-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="funnel">Funil de vendas</TabsTrigger>
          <TabsTrigger value="proposals">Orçamentos &amp; propostas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Propostas criadas por dia</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ChartContainer
                config={{
                  proposals: {
                    label: "Propostas",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-full"
              >
                <AreaChart data={COMMERCIAL_DAILY_VOLUME}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.substring(5)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="proposals"
                    stroke="hsl(var(--primary))"
                    fill="url(#proposals)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="proposals" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {COMMERCIAL_STAGES.map((stage) => (
              <Card
                key={stage.id}
                className={
                  selectedStage === stage.id
                    ? "border-primary/80 bg-primary/5"
                    : "border-border/70 bg-surface-elevated/80"
                }
                onClick={() => setSelectedStage(stage.id)}
              >
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {stage.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xl font-semibold">
                    {COMMERCIAL_PROPOSALS.filter((p) => p.stageId === stage.id).length}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Clique para filtrar a tabela de propostas.
                  </p>
                </CardContent>
              </Card>
            ))}
            <Card
              className={
                selectedStage === "todos"
                  ? "border-primary/80 bg-primary/5"
                  : "border-border/70 bg-surface-elevated/80"
              }
              onClick={() => setSelectedStage("todos")}
            >
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">Todas as etapas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xl font-semibold">{COMMERCIAL_PROPOSALS.length}</p>
                <p className="text-[11px] text-muted-foreground">Mostra o funil completo.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Orçamentos &amp; propostas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tratamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.map((proposal) => (
                    <TableRow key={proposal.id} className="text-sm">
                      <TableCell>{proposal.clientName}</TableCell>
                      <TableCell>{proposal.treatment}</TableCell>
                      <TableCell className="text-right">
                        {proposal.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                          {proposal.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>{proposal.createdAt}</TableCell>
                      <TableCell>{proposal.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComercialV2Page;

