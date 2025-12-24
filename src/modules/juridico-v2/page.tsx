import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LEGAL_TERMS, LGPD_LOGS } from "./mock";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusPill } from "@/components/dashboard/StatusPill";


const JuridicoV2Page = () => {
  const activeTerms = LEGAL_TERMS.filter((t) => t.status === "ativo").length;

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Jurídico &amp; LGPD</h1>
        <p className="text-sm text-muted-foreground">
          Central de termos, consentimentos, políticas e controles de acesso para conformidade com a LGPD.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Termos ativos" value={activeTerms} />
        <KpiCard label="Modelos cadastrados" value={LEGAL_TERMS.length} />
        <KpiCard label="Eventos recentes" value={LGPD_LOGS.length} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Modelos de termos e políticas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LEGAL_TERMS.map((term) => (
                  <TableRow key={term.id} className="text-sm">
                    <TableCell>{term.name}</TableCell>
                    <TableCell>{term.version}</TableCell>
                    <TableCell className="capitalize">{term.type}</TableCell>
                    <TableCell>{term.startDate}</TableCell>
                    <TableCell>
                      <StatusPill
                        label={term.status}
                        tone={term.status === "ativo" ? "success" : term.status === "rascunho" ? "warning" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Logs de acesso a dados sensíveis</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LGPD_LOGS.map((log) => (
                  <TableRow key={log.id} className="text-sm">
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell>{log.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JuridicoV2Page;

