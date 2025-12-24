import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PEOPLE_GOALS, PEOPLE_KPIS, PEOPLE_PROFESSIONALS, PEOPLE_SCHEDULES } from "./mock";

const PessoasV2Page = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Pessoas &amp; Metas</h1>
        <p className="text-sm text-muted-foreground">
          Gestão de profissionais, escalas, metas e comissionamento da clínica.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{PEOPLE_KPIS.professionalsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Metas ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{PEOPLE_KPIS.activeGoals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Taxa média de comparecimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{PEOPLE_KPIS.averageAttendanceRate}%</p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="professionals" className="mt-2 flex-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="professionals">Visão por profissional</TabsTrigger>
          <TabsTrigger value="schedules">Escalas</TabsTrigger>
          <TabsTrigger value="goals">Metas &amp; comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="professionals" className="mt-4 grid gap-3 md:grid-cols-3">
          {PEOPLE_PROFESSIONALS.map((prof) => (
            <Card key={prof.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {prof.avatarInitials}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{prof.name}</p>
                    <p className="text-xs text-muted-foreground">{prof.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Atendimentos</p>
                  <p className="text-sm font-semibold">{prof.appointmentsThisMonth}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Faturamento</p>
                  <p className="text-sm font-semibold">
                    {prof.revenueThisMonth.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Comparecimento</p>
                  <p className="text-sm font-semibold">{prof.attendanceRate}%</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="schedules" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Escalas semanais</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Dia da semana</TableHead>
                    <TableHead>Período</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PEOPLE_SCHEDULES.map((row) => (
                    <TableRow key={row.id} className="text-sm">
                      <TableCell>{row.professional}</TableCell>
                      <TableCell>{row.weekday}</TableCell>
                      <TableCell>{row.period}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Metas &amp; comissões</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="text-right">Meta</TableHead>
                    <TableHead className="text-right">Realizado</TableHead>
                    <TableHead className="text-right">% Atingido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PEOPLE_GOALS.map((goal) => {
                    const percent = (goal.realized / goal.goal) * 100;
                    return (
                      <TableRow key={goal.id} className="text-sm">
                        <TableCell>{goal.professional}</TableCell>
                        <TableCell className="text-right">
                          {goal.goal.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {goal.realized.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell className="text-right">{percent.toFixed(1)}%</TableCell>
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

export default PessoasV2Page;

