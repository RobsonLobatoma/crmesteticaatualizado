import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AGENDA_DAY_SLOTS, AGENDA_KPIS, AGENDA_NO_SHOWS, AGENDA_WAITLIST } from "./mock";
import { StatusPill } from "@/components/dashboard/StatusPill";

const AgendaV2Page = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Recepção &amp; Agenda Inteligente</h1>
        <p className="text-sm text-muted-foreground">
          Agenda inteligente com visão por profissional, sala e acompanhamento de lista de espera e no-show.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Agendados para hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{AGENDA_KPIS.scheduledToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Na lista de espera</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{AGENDA_KPIS.waitlist}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Taxa de no-show</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{AGENDA_KPIS.noShowRate}%</p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="day" className="mt-2 flex-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="day">Agenda diária</TabsTrigger>
          <TabsTrigger value="waitlist">Lista de espera &amp; no-show</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Timeline do dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {AGENDA_DAY_SLOTS.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">{slot.time}</p>
                    <p className="font-medium text-foreground">{slot.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {slot.professional} • {slot.room}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    {slot.status === "confirmado" && <StatusPill label="Confirmado" tone="success" />}
                    {slot.status === "em_confirmacao" && <StatusPill label="Em confirmação" tone="info" />}
                    {slot.status === "no_show" && <StatusPill label="No-show" tone="danger" />}
                  </div>

                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resumo do dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Esta visão consolida a agenda diária da recepção e, no futuro, será integrada ao WhatsApp para
                confirmações automáticas e recados em massa.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Lista de espera</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AGENDA_WAITLIST.map((item) => (
                    <TableRow key={item.id} className="text-sm">
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell>{item.procedure}</TableCell>
                      <TableCell className="capitalize">{item.priority}</TableCell>
                      <TableCell>{item.origin}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">No-show recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Remarcado?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AGENDA_NO_SHOWS.map((item) => (
                    <TableRow key={item.id} className="text-sm">
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="max-w-[260px] text-xs text-muted-foreground">
                        {item.reason}
                      </TableCell>
                      <TableCell>{item.rescheduled ? "Sim" : "Não"}</TableCell>
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

export default AgendaV2Page;

