import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDashDiario } from "./hooks/useDashDiario";
import { useLeads } from "@/modules/leads-v2/hooks/useLeads";
import { Lead } from "@/modules/leads-v2/types/Lead";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashDiarioV2Page = () => {
  const { toast } = useToast();
  const { leads } = useLeads();
  const {
    ano,
    mes,
    entradas,
    handleChangeMes,
    handleChangeAno,
    handleCellChange,
    handleRemoverLinha,
  } = useDashDiario(leads);

  useEffect(() => {
    document.title = "Dash-Diário | Studio CRM";

    const description =
      "Dash-Diário com resumo diário de leads, conversões e faturamento.";
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  const handleSalvar = () => {
    toast({
      title: "Dash-Diário salvo",
      description:
        "Os dados do Dash-Diário foram salvos nesta sessão (somente em memória).",
    });
  };

  const nomeMeses = [
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

  const cellInputClass =
    "h-6 w-full max-w-[55px] px-0 text-center text-[11px] border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

  const soma = (campo: keyof (typeof entradas)[number]) =>
    entradas.reduce((acc, entrada) => acc + (Number(entrada[campo] || "0") || 0), 0);

  const somaNumero = (valor: string) => Number(valor || "0") || 0;

  const metricasMensais: { metrica: string; valor: string }[] = [
    { metrica: "Leads novos (Total)", valor: String(soma("leadsNovosTotal")) },
    { metrica: "Conversados (Total)", valor: String(soma("conversadosTotal")) },
    { metrica: "Follow-up (Total)", valor: String(soma("followUpTotal")) },
    {
      metrica: "Avaliações agendadas no mês (Data Agendamento)",
      valor: String(soma("agendadasHojeTotal")),
    },
    {
      metrica: "Avaliações marcadas para o mês (Data Avaliação)",
      valor: String(soma("avaliacoesHoje")),
    },
    { metrica: "Compareceram no mês", valor: String(soma("compareceramHoje")) },
    { metrica: "Show rate do mês", valor: "-" },
    { metrica: "Fechamentos no mês", valor: String(soma("fechamentosHoje")) },
    { metrica: "R$ Fechado no mês", valor: "" },
    { metrica: "Fechamento por avaliação (conv.)", valor: "" },
    { metrica: "R$ por fechamento (ticket real)", valor: "" },
    { metrica: "R$ por avaliação realizada", valor: "" },
  ];

  const parseDateFlexible = (value?: string | null): Date | null => {
    if (!value) return null;

    // Normaliza strings ISO com horário (ex: 2025-12-23T00:00:00Z) para só a parte da data
    if (value.includes("-")) {
      const [datePart] = value.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      if (!year || !month || !day) return null;
      const parsed = new Date(year, month - 1, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    // Formato brasileiro dd/MM/yyyy
    if (value.includes("/")) {
      const [day, month, year] = value.split("/").map(Number);
      if (!day || !month || !year) return null;
      const parsed = new Date(year, month - 1, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  };
  const isSameDay = (leadDateStr?: string | null, dashDateStr?: string | null) => {
    const leadDate = parseDateFlexible(leadDateStr || undefined);
    const dashDate = parseDateFlexible(dashDateStr || undefined);
    if (!leadDate || !dashDate) return false;
    return (
      leadDate.getFullYear() === dashDate.getFullYear() &&
      leadDate.getMonth() === dashDate.getMonth() &&
      leadDate.getDate() === dashDate.getDate()
    );
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateLeads, setSelectedDateLeads] = useState<Lead[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [responsavelFilter, setResponsavelFilter] = useState<string>("todos");
  const [origemFilter, setOrigemFilter] = useState<string>("todos");

  const uniqueStatuses = Array.from(
    new Set(selectedDateLeads.map((lead) => lead.status).filter(Boolean)),
  ).sort();

  const uniqueResponsaveis = Array.from(
    new Set(selectedDateLeads.map((lead) => lead.responsavel).filter(Boolean)),
  ).sort();

  const uniqueOrigens = Array.from(
    new Set(selectedDateLeads.map((lead) => lead.origem).filter(Boolean)),
  ).sort();

  const filteredLeads = selectedDateLeads.filter((lead) => {
    const matchStatus =
      statusFilter === "todos" ||
      lead.status?.toLowerCase().includes(statusFilter.toLowerCase());
    const matchResponsavel =
      responsavelFilter === "todos" ||
      lead.responsavel?.toLowerCase().includes(responsavelFilter.toLowerCase());
    const matchOrigem =
      origemFilter === "todos" ||
      lead.origem?.toLowerCase().includes(origemFilter.toLowerCase());

    return matchStatus && matchResponsavel && matchOrigem;
  });

  const handleOpenDetail = (entradaData: string) => {
    const leadsDaData = leads.filter((lead) =>
      isSameDay(lead.dataEntrada, entradaData),
    );
    setSelectedDate(entradaData);
    setSelectedDateLeads(leadsDaData);
    setStatusFilter("todos");
    setResponsavelFilter("todos");
    setOrigemFilter("todos");
    setIsDetailOpen(true);
  };

  return (
    <main className="flex w-full flex-1 flex-col gap-2 px-3 pt-2 lg:px-4">
      <section>
        <Card className="bg-background/80 shadow-soft">
          <CardHeader className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Dash-Diário
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Visão diária de leads, conversões e faturamento. Selecione o mês
                e o ano para gerar automaticamente todas as datas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Mês</span>
                <select
                  className="h-7 rounded-sm border border-border bg-background px-1.5 text-[11px]"
                  value={mes}
                  onChange={(e) => handleChangeMes(e.target.value)}
                >
                  {nomeMeses.map((nome, index) => (
                    <option key={nome} value={index}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Ano</span>
                <Input
                  type="number"
                  className="h-7 w-20 px-1.5 text-[11px] rounded-sm"
                  value={ano}
                  onChange={(e) => handleChangeAno(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={handleSalvar}>
                Salvar Dash-Diário
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                  <TableHead className="px-1 py-1">
                    <span className="whitespace-nowrap">Data</span>
                  </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Leads novos
                        <br />
                        (Total)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Leads novos
                        <br />
                        (WhatsApp)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Leads novos
                        <br />
                        (Instagram)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Conversados
                        <br />
                        (Total)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Conversados
                        <br />
                        (WhatsApp)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Conversados
                        <br />
                        (Instagram)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Follow-up
                        <br />
                        (Total)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Agendadas
                        <br />
                        HOJE (Total)
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Avaliações marcadas
                        <br />
                        HOJE
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Compareceram
                        <br />
                        HOJE
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Show rate
                        <br />
                        %
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        Fechamentos
                        <br />
                        HOJE
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 text-[10px]">
                      <span className="whitespace-nowrap">
                        R$ Fechado
                        <br />
                        HOJE
                      </span>
                    </TableHead>
                    <TableHead className="px-1 py-1 w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entradas.map((entrada, index) => (
                    <TableRow key={entrada.data} className="h-6 [&>td]:py-0.5">
                      <TableCell className="whitespace-nowrap px-1 py-0.5 text-[11px]">
                        {entrada.data}
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.leadsNovosTotal}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "leadsNovosTotal",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.leadsNovosWhatsapp}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "leadsNovosWhatsapp",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.leadsNovosInstagram}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "leadsNovosInstagram",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.conversadosTotal}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "conversadosTotal",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.conversadosWhatsapp}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "conversadosWhatsapp",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.conversadosInstagram}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "conversadosInstagram",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.followUpTotal}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "followUpTotal",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.agendadasHojeTotal}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "agendadasHojeTotal",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.avaliacoesHoje}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "avaliacoesHoje",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.compareceramHoje}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "compareceramHoje",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cellInputClass}
                          value={entrada.showRatePercent}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "showRatePercent",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cn(
                            cellInputClass,
                            Number(entrada.fechamentosHoje || 0) > 0 &&
                              "bg-accent/40 font-semibold text-foreground",
                          )}
                          value={entrada.fechamentosHoje}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "fechamentosHoje",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5">
                        <Input
                          type="text"
                          className={cn(
                            cellInputClass,
                            Number(entrada.valorFechadoHoje || 0) > 0 &&
                              "bg-accent/40 font-semibold text-foreground",
                          )}
                          value={entrada.valorFechadoHoje}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              "valorFechadoHoje",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right text-[11px]">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => handleOpenDetail(entrada.data)}
                          >
                            Ver leads
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                            onClick={() => handleRemoverLinha(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Leads do dia {selectedDate}</DialogTitle>
            <DialogDescription>
              Detalhamento de todos os leads que compõem os números desse dia.
            </DialogDescription>
          </DialogHeader>

          {filteredLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum lead encontrado para essa combinação de filtros.
            </p>
          ) : (
            <div className="max-h-[460px] space-y-4 overflow-y-auto">
              <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/60 p-2">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Filtros:
                </span>

                {/* Filtro de status */}
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-muted-foreground">Status</span>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="h-7 w-32 border-border bg-background px-2 text-[11px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="text-[11px]">
                      <SelectItem value="todos">Todos</SelectItem>
                      {uniqueStatuses.map((status) => (
                        <SelectItem key={status} value={String(status)}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de responsável */}
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-muted-foreground">Responsável</span>
                  <Select
                    value={responsavelFilter}
                    onValueChange={(value) => setResponsavelFilter(value)}
                  >
                    <SelectTrigger className="h-7 w-32 border-border bg-background px-2 text-[11px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="text-[11px]">
                      <SelectItem value="todos">Todos</SelectItem>
                      {uniqueResponsaveis.map((resp) => (
                        <SelectItem key={resp} value={String(resp)}>
                          {resp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de origem */}
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-muted-foreground">Origem</span>
                  <Select
                    value={origemFilter}
                    onValueChange={(value) => setOrigemFilter(value)}
                  >
                    <SelectTrigger className="h-7 w-32 border-border bg-background px-2 text-[11px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="text-[11px]">
                      <SelectItem value="todos">Todos</SelectItem>
                      {uniqueOrigens.map((origem) => (
                        <SelectItem key={origem} value={String(origem)}>
                          {origem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setStatusFilter("todos");
                    setResponsavelFilter("todos");
                    setOrigemFilter("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>

              {/* Leads fechados */}
              <section>
                <h4 className="mb-1 text-[11px] font-semibold text-foreground">
                  Leads fechados (contam para R$ Fechado HOJE)
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">Nome</TableHead>
                      <TableHead className="text-[11px]">Contato</TableHead>
                      <TableHead className="text-[11px]">Responsável</TableHead>
                      <TableHead className="text-[11px]">Origem</TableHead>
                      <TableHead className="text-[11px]">Status</TableHead>
                      <TableHead className="text-[11px]">Data entrada</TableHead>
                      <TableHead className="text-[11px] text-right">
                        R$ Fechado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads
                      .filter((lead) =>
                        lead.status?.toLowerCase().includes("fech"),
                      )
                      .map((lead) => (
                        <TableRow
                          key={`fechado-${lead.id}`}
                          className="h-7 bg-accent/40"
                        >
                          <TableCell className="text-[11px]">
                            {lead.nome}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.contato}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.responsavel}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.origem}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.status}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.dataEntrada}
                          </TableCell>
                          <TableCell className="text-right text-[11px] font-semibold">
                            {lead.valorFechado
                              ? Number(lead.valorFechado).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </section>

              {/* Outros leads do dia */}
              <section>
                <h4 className="mb-1 text-[11px] font-semibold text-muted-foreground">
                  Outros leads do dia (não contam para R$ Fechado HOJE)
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">Nome</TableHead>
                      <TableHead className="text-[11px]">Contato</TableHead>
                      <TableHead className="text-[11px]">Responsável</TableHead>
                      <TableHead className="text-[11px]">Origem</TableHead>
                      <TableHead className="text-[11px]">Status</TableHead>
                      <TableHead className="text-[11px]">Data entrada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads
                      .filter(
                        (lead) =>
                          !lead.status?.toLowerCase().includes("fech"),
                      )
                      .map((lead) => (
                        <TableRow key={`outro-${lead.id}`} className="h-7">
                          <TableCell className="text-[11px]">
                            {lead.nome}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.contato}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.responsavel}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.origem}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.status}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {lead.dataEntrada}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <section>
        <Card className="bg-background/80 shadow-soft">
          <CardHeader className="flex flex-col gap-1 py-3">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Dash-Mensal
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Resumo mensal usando o mesmo ano e mês selecionados no Dash-Diário.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                Ano: <span className="font-medium text-foreground">{ano}</span>
              </span>
              <span className="text-muted-foreground">
                Mês: <span className="font-medium text-foreground">{mes + 1}</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-7">
                    <TableHead className="w-2/3 px-2 py-1 text-[11px]">
                      Métrica
                    </TableHead>
                    <TableHead className="w-1/3 px-2 py-1 text-right text-[11px]">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricasMensais.map((item) => (
                    <TableRow key={item.metrica} className="h-7 [&>td]:py-1">
                      <TableCell className="px-2 text-[11px]">
                        {item.metrica}
                      </TableCell>
                      <TableCell className="px-2 text-right text-[11px]">
                        {item.valor}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default DashDiarioV2Page;
