import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { MARKETING_CHANNELS, MARKETING_KPIS, MARKETING_NPS } from "./mock";
import { KpiCard } from "@/components/dashboard/KpiCard";

const MarketingV2Page = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Marketing &amp; Relacionamento</h1>
        <p className="text-sm text-muted-foreground">
          Base para campanhas segmentadas, playbooks de mensagens, NPS e reativação de pacientes.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Campanhas ativas" value={MARKETING_KPIS.activeCampaigns} />
        <KpiCard label="Contatos alcançados" value={MARKETING_KPIS.reachedContacts} />
        <KpiCard label="Taxa média de resposta" value={`${MARKETING_KPIS.responseRate}%`} />
      </section>

      <Tabs defaultValue="overview" className="mt-2 flex-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="nps">NPS &amp; pesquisas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retorno por canal</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ChartContainer
                config={{
                  revenue: { label: "Receita", color: "hsl(var(--primary))" },
                }}
                className="h-full"
              >
                <BarChart data={MARKETING_CHANNELS}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="channel" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Desempenho por canal</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Mensagens enviadas</TableHead>
                    <TableHead className="text-right">Respostas</TableHead>
                    <TableHead className="text-right">Taxa de resposta</TableHead>
                    <TableHead className="text-right">Receita gerada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MARKETING_CHANNELS.map((row) => {
                    const responseRate = (row.responses / row.sent) * 100;
                    return (
                      <TableRow key={row.id} className="text-sm">
                        <TableCell>{row.channel}</TableCell>
                        <TableCell className="text-right">{row.sent}</TableCell>
                        <TableCell className="text-right">{row.responses}</TableCell>
                        <TableCell className="text-right">{responseRate.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">
                          {row.revenue.toLocaleString("pt-BR", {
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

        <TabsContent value="nps" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Últimas respostas de NPS</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Comentário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MARKETING_NPS.map((nps) => (
                    <TableRow key={nps.id} className="text-sm">
                      <TableCell>{nps.date}</TableCell>
                      <TableCell>{nps.score}</TableCell>
                      <TableCell className="max-w-[420px] text-xs text-muted-foreground">
                        {nps.comment ?? "—"}
                      </TableCell>
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

export default MarketingV2Page;

