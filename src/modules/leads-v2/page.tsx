import { useState } from "react";
import { BarChart3, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "./types/Lead";
import { useLeads } from "./hooks/useLeads";

const LeadsV2Page = () => {
  const { toast } = useToast();
  const { leads, createLead, updateLead, deleteLead } = useLeads();
  const [newLead, setNewLead] = useState<Omit<Lead, "id" | "status"> & { status?: string }>({
    data: "",
    dataEntrada: "",
    responsavel: "",
    nome: "",
    contato: "",
    origem: "",
    procedimento: "",
    dataUltimoContato: "",
    dataAgendamento: "",
    dataAvaliacao: "",
    compareceu: "",
    dataFechamento: "",
    valorFechado: "",
    observacao: "",
    status: "Novo lead",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [responsavelFilter, setResponsavelFilter] = useState<string>("");
  const [origemFilter, setOrigemFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [isHojeDetailOpen, setIsHojeDetailOpen] = useState(false);

  const handleChange = (field: keyof typeof newLead, value: string) => {
    setNewLead((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditingChange = (field: keyof Lead, value: string) => {
    setEditingLead((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAddLead = async () => {
    if (!newLead.nome || !newLead.contato) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Nome e contato são obrigatórios para salvar o lead.",
        variant: "destructive",
      });
      return;
    }

    const hoje = new Date().toLocaleDateString("pt-BR");

    try {
      await createLead({
        nome: newLead.nome,
        contato: newLead.contato,
        responsavel: newLead.responsavel || "-",
        origem: newLead.origem || "Manual",
      });

      setNewLead({
        data: "",
        dataEntrada: "",
        responsavel: "",
        nome: "",
        contato: "",
        origem: "",
        procedimento: "",
        dataUltimoContato: "",
        dataAgendamento: "",
        dataAvaliacao: "",
        compareceu: "",
        dataFechamento: "",
        valorFechado: "",
        observacao: "",
        status: "Novo lead",
      });
    } catch {
      // Os toasts de erro já são tratados dentro do hook useLeads
    }
  };

  const handleStartEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setEditingLead(lead);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingLead(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingLead) return;

    if (!editingLead.nome || !editingLead.contato) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Nome e contato são obrigatórios para salvar o lead.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateLead(editingLead);
      setEditingId(null);
      setEditingLead(null);
    } catch {
      // Os toasts de erro já são tratados dentro do hook useLeads
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditingLead(null);
    }

    try {
      await deleteLead(id);
    } catch {
      // Os toasts de erro já são tratados dentro do hook useLeads
    }
  };

  const parseDate = (value: string): Date | null => {
    if (!value) return null;

    // Normaliza strings ISO com horário (ex: 2025-12-23T00:00:00Z) para só a parte da data
    if (value.includes("-")) {
      const [datePart] = value.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      if (!year || !month || !day) return null;
      const parsed = new Date(year, month - 1, day);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    if (value.includes("/")) {
      const [day, month, year] = value.split("/").map(Number);
      if (!day || !month || !year) return null;
      const parsed = new Date(year, month - 1, day);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  };

  const isToday = (value?: string | null): boolean => {
    if (!value) return false;
    const date = parseDate(value);
    if (!date) return false;

    const hoje = new Date();
    return (
      date.getFullYear() === hoje.getFullYear() &&
      date.getMonth() === hoje.getMonth() &&
      date.getDate() === hoje.getDate()
    );
  };

  const isWithinRange = (dateStr: string | undefined, start: string, end: string): boolean => {
    if (!dateStr) return false;
    const date = parseDate(dateStr);
    if (!date) return false;

    const startDate = start ? parseDate(start) : null;
    const endDate = end ? parseDate(end) : null;

    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;

    return true;
  };

  const leadsHojeLista = leads.filter((lead) =>
    isToday(lead.dataEntrada || lead.data),
  );
  const leadsHoje = leadsHojeLista.length;

  const filteredLeads = leads.filter((lead) => {
    const matchStatus = statusFilter ? lead.status === statusFilter : true;
    const matchResponsavel = responsavelFilter ? lead.responsavel === responsavelFilter : true;
    const matchOrigem = origemFilter ? lead.origem === origemFilter : true;
    const matchDateRange = startDateFilter || endDateFilter
      ? isWithinRange(lead.dataEntrada, startDateFilter, endDateFilter)
      : true;

    return matchStatus && matchResponsavel && matchOrigem && matchDateRange;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Novo(hoje)":
        return "border-muted text-muted-foreground bg-muted/40";
      case "Em Atendimento":
        return "border-sky-500/40 text-sky-600 dark:text-sky-300 bg-sky-500/10";
      case "Qualificado":
        return "border-emerald-500/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10";
      case "Não Qualificado":
        return "border-destructive/60 text-destructive bg-destructive/5";
      case "Avaliação Confirmada":
        return "border-indigo-500/40 text-indigo-600 dark:text-indigo-300 bg-indigo-500/10";
      case "Compareceu":
        return "border-emerald-500/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10";
      case "Faltou":
        return "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10";
      case "Proposta Enviada":
        return "border-sky-500/40 text-sky-600 dark:text-sky-300 bg-sky-500/10";
      case "Fechou":
        return "border-emerald-500/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10";
      case "Não Fechou":
        return "border-destructive/60 text-destructive bg-destructive/5";
      case "Pós Venda":
        return "border-violet-500/40 text-violet-600 dark:text-violet-300 bg-violet-500/10";
      case "Indicação":
        return "border-teal-500/40 text-teal-600 dark:text-teal-300 bg-teal-500/10";
      default:
        return "border-muted text-muted-foreground bg-muted/40";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads do dia</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre e acompanhe em tempo real os leads recebidos hoje via WhatsApp, Instagram e outros canais.
            </p>
          </div>
          <Button className="hidden gap-2 bg-crm-hero text-primary-foreground shadow-elevated hover:brightness-110 md:inline-flex">
            <PlusCircle className="h-4 w-4" />
            Novo lead rápido
          </Button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            className="relative overflow-hidden border-border/80 bg-surface-elevated/90 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated cursor-pointer"
            onClick={() => setIsHojeDetailOpen(true)}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-crm-hero" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                Leads cadastrados hoje
                <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
                  Ao vivo
                </Badge>
              </CardTitle>
              <CardDescription>Volume total de leads salvos na data de hoje.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-semibold">{leadsHoje}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-surface-elevated/90 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                Taxa de conversão
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Estimativa com base nos últimos 30 dias.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4 pt-0 text-sm">
              <div>
                <p className="text-3xl font-semibold">0%</p>
                <p className="text-xs text-muted-foreground">Sem dados suficientes</p>
              </div>
              <div className="h-14 w-24 rounded-md bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent" />
            </CardContent>
          </Card>
 
          <Card className="border-border/80 bg-surface-elevated/90 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agenda da semana</CardTitle>
              <CardDescription>Resumo rápido dos agendamentos originados dos leads.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 pt-0 text-sm">
              <div>
                <p className="text-3xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">consultas confirmadas</p>
              </div>
              <div className="flex flex-col items-end text-right text-xs text-muted-foreground">
                <span>0 avaliações</span>
                <span>0 retornos</span>
                <span>0 novos fechamentos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <Dialog open={isHojeDetailOpen} onOpenChange={setIsHojeDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Leads cadastrados hoje</DialogTitle>
            <DialogDescription>
              Lista de todos os leads cadastrados na data de hoje.
            </DialogDescription>
          </DialogHeader>

          {leadsHojeLista.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lead cadastrado hoje.</p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
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
                  {leadsHojeLista.map((lead) => (
                    <TableRow key={lead.id} className="h-7">
                      <TableCell className="text-[11px]">{lead.nome}</TableCell>
                      <TableCell className="text-[11px]">{lead.contato}</TableCell>
                      <TableCell className="text-[11px]">{lead.responsavel}</TableCell>
                      <TableCell className="text-[11px]">{lead.origem}</TableCell>
                      <TableCell className="text-[11px]">{lead.status}</TableCell>
                      <TableCell className="text-[11px]">{lead.dataEntrada}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <section aria-labelledby="cadastro-rapido" className="space-y-4">
        <Card className="border-border/70 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle id="cadastro-rapido" className="text-base">
                  Leads do dia (cadastro rápido)
                </CardTitle>
                <CardDescription>
                  Preencha a linha abaixo para cadastrar rapidamente um lead recebido hoje.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-1 rounded-full border-border/80 bg-surface-subtle text-xs"
                onClick={handleAddLead}
              >
                <PlusCircle className="h-3 w-3" />
                Salvar lead
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data</label>
                <Input
                  type="date"
                  value={newLead.data}
                  onChange={(e) => handleChange("data", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Responsável</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground shadow-sm transition-colors hover:bg-muted/60"
                  value={newLead.responsavel}
                  onChange={(e) => handleChange("responsavel", e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="Nara Helizabeth">Nara Helizabeth</option>
                  <option value="Adrielly Durans">Adrielly Durans</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome do cliente</label>
                <Input
                  placeholder="Nome do lead"
                  value={newLead.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Contato WhatsApp ou @</label>
                <Input
                  placeholder="(11) 99999-9999 ou @usuario"
                  value={newLead.contato}
                  onChange={(e) => handleChange("contato", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Origem</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground shadow-sm transition-colors hover:bg-muted/60"
                  value={newLead.origem}
                  onChange={(e) => handleChange("origem", e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Anúncio">Anúncio</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Promoção">Promoção</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Procedimento / Interesse</label>
                <Input
                  placeholder="Botox, lipo, avaliação..."
                  value={newLead.procedimento}
                  onChange={(e) => handleChange("procedimento", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground shadow-sm transition-colors hover:bg-muted/60"
                  value={newLead.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="Novo(hoje)">Novo(hoje)</option>
                  <option value="Em Atendimento">Em Atendimento</option>
                  <option value="Qualificado">Qualificado</option>
                  <option value="Não Qualificado">Não Qualificado</option>
                  <option value="Avaliação Confirmada">Avaliação Confirmada</option>
                  <option value="Compareceu">Compareceu</option>
                  <option value="Faltou">Faltou</option>
                  <option value="Proposta Enviada">Proposta Enviada</option>
                  <option value="Fechou">Fechou</option>
                  <option value="Não Fechou">Não Fechou</option>
                  <option value="Pós Venda">Pós Venda</option>
                  <option value="Indicação">Indicação</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Entrada</label>
                <Input
                  type="date"
                  value={newLead.dataEntrada}
                  onChange={(e) => handleChange("dataEntrada", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Último Contato</label>
                <Input
                  type="date"
                  value={newLead.dataUltimoContato}
                  onChange={(e) => handleChange("dataUltimoContato", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Agendamento (quando marcou)</label>
                <Input
                  type="date"
                  value={newLead.dataAgendamento}
                  onChange={(e) => handleChange("dataAgendamento", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Avaliação (dia marcado)</label>
                <Input
                  type="date"
                  value={newLead.dataAvaliacao}
                  onChange={(e) => handleChange("dataAvaliacao", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Compareceu?</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground shadow-sm transition-colors hover:bg-muted/60"
                  value={newLead.compareceu}
                  onChange={(e) => handleChange("compareceu", e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Fechamento</label>
                <Input
                  type="date"
                  value={newLead.dataFechamento}
                  onChange={(e) => handleChange("dataFechamento", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Valor Fechado (R$)</label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={newLead.valorFechado}
                  onChange={(e) => handleChange("valorFechado", e.target.value)}
                />
              </div>
              <div className="md:col-span-3 lg:col-span-6">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Objeção / Observação</label>
                <Input
                  placeholder="Detalhes importantes do lead (interesse, objeção, procedimento...)"
                  value={newLead.observacao}
                  onChange={(e) => handleChange("observacao", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="leads-hoje" className="space-y-3 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="leads-hoje" className="text-base font-semibold">
              Leads cadastrados hoje
            </h2>
            <p className="text-xs text-muted-foreground">
              Visualize todos os leads cadastrados hoje e acompanhe o status de cada oportunidade.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">Status</span>
              <select
                className="flex h-8 min-w-[150px] rounded-md border border-input bg-background px-2 text-[11px] text-foreground shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Novo(hoje)">Novo(hoje)</option>
                <option value="Em Atendimento">Em Atendimento</option>
                <option value="Qualificado">Qualificado</option>
                <option value="Não Qualificado">Não Qualificado</option>
                <option value="Avaliação Confirmada">Avaliação Confirmada</option>
                <option value="Compareceu">Compareceu</option>
                <option value="Faltou">Faltou</option>
                <option value="Proposta Enviada">Proposta Enviada</option>
                <option value="Fechou">Fechou</option>
                <option value="Não Fechou">Não Fechou</option>
                <option value="Pós Venda">Pós Venda</option>
                <option value="Indicação">Indicação</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">Responsável</span>
              <select
                className="flex h-8 min-w-[150px] rounded-md border border-input bg-background px-2 text-[11px] text-foreground shadow-sm"
                value={responsavelFilter}
                onChange={(e) => setResponsavelFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Nara Helizabeth">Nara Helizabeth</option>
                <option value="Adrielly Durans">Adrielly Durans</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">Origem</span>
              <select
                className="flex h-8 min-w-[150px] rounded-md border border-input bg-background px-2 text-[11px] text-foreground shadow-sm"
                value={origemFilter}
                onChange={(e) => setOrigemFilter(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Anúncio">Anúncio</option>
                <option value="Indicação">Indicação</option>
                <option value="Promoção">Promoção</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">De</span>
              <Input
                type="date"
                className="h-8 text-[11px]"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">Até</span>
              <Input
                type="date"
                className="h-8 text-[11px]"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-8 rounded-full px-3 text-[11px]"
              onClick={() => {
                setStatusFilter("");
                setResponsavelFilter("");
                setOrigemFilter("");
                setStartDateFilter("");
                setEndDateFilter("");
              }}
            >
              Limpar filtros
            </Button>
            <Button variant="outline" size="sm" className="mt-1 h-8 rounded-full px-3 text-[11px]">
              Exportar planilha
            </Button>
          </div>
        </div>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>Contato WhatsApp/@</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Procedimento / Interesse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Entrada</TableHead>
                  <TableHead>Data Último Contato</TableHead>
                  <TableHead>Data Agendamento (quando marcou)</TableHead>
                  <TableHead>Data Avaliação (dia marcado)</TableHead>
                  <TableHead>Compareceu?</TableHead>
                  <TableHead>Data Fechamento</TableHead>
                  <TableHead>Valor Fechado (R$)</TableHead>
                  <TableHead>Objeção / Observação</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const isEditing = editingId === lead.id;
                  const current = isEditing && editingLead ? editingLead : lead;

                  return (
                    <TableRow key={lead.id} className="hover:bg-muted/40">
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{current.data}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {isEditing ? (
                          <select
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground shadow-sm"
                            value={current.responsavel}
                            onChange={(e) => handleEditingChange("responsavel", e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Nara Helizabeth">Nara Helizabeth</option>
                            <option value="Adrielly Durans">Adrielly Durans</option>
                          </select>
                        ) : (
                          current.responsavel
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="h-8 text-xs"
                            value={current.nome}
                            onChange={(e) => handleEditingChange("nome", e.target.value)}
                          />
                        ) : (
                          current.nome
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {isEditing ? (
                          <Input
                            className="h-8 text-xs"
                            value={current.contato}
                            onChange={(e) => handleEditingChange("contato", e.target.value)}
                          />
                        ) : (
                          current.contato
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="h-8 text-xs"
                            value={current.origem}
                            onChange={(e) => handleEditingChange("origem", e.target.value)}
                          />
                        ) : (
                          current.origem
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="h-8 text-xs"
                            value={current.procedimento}
                            onChange={(e) => handleEditingChange("procedimento", e.target.value)}
                          />
                        ) : (
                          current.procedimento
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <select
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground shadow-sm"
                            value={current.status}
                            onChange={(e) => handleEditingChange("status", e.target.value)}
                          >
                            <option value="Novo(hoje)">Novo(hoje)</option>
                            <option value="Em Atendimento">Em Atendimento</option>
                            <option value="Qualificado">Qualificado</option>
                            <option value="Não Qualificado">Não Qualificado</option>
                            <option value="Avaliação Confirmada">Avaliação Confirmada</option>
                            <option value="Compareceu">Compareceu</option>
                            <option value="Faltou">Faltou</option>
                            <option value="Proposta Enviada">Proposta Enviada</option>
                            <option value="Fechou">Fechou</option>
                            <option value="Não Fechou">Não Fechou</option>
                            <option value="Pós Venda">Pós Venda</option>
                            <option value="Indicação">Indicação</option>
                          </select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[11px] font-medium ${getStatusBadgeClass(current.status)}`}
                          >
                            {current.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={current.dataEntrada}
                            onChange={(e) => handleEditingChange("dataEntrada", e.target.value)}
                          />
                        ) : (
                          current.dataEntrada
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={current.dataUltimoContato || ""}
                            onChange={(e) => handleEditingChange("dataUltimoContato", e.target.value)}
                          />
                        ) : (
                          current.dataUltimoContato
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={current.dataAgendamento || ""}
                            onChange={(e) => handleEditingChange("dataAgendamento", e.target.value)}
                          />
                        ) : (
                          current.dataAgendamento
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={current.dataAvaliacao || ""}
                            onChange={(e) => handleEditingChange("dataAvaliacao", e.target.value)}
                          />
                        ) : (
                          current.dataAvaliacao
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {isEditing ? (
                          <select
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground shadow-sm"
                            value={current.compareceu || ""}
                            onChange={(e) => handleEditingChange("compareceu", e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                          </select>
                        ) : (
                          current.compareceu
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={current.dataFechamento || ""}
                            onChange={(e) => handleEditingChange("dataFechamento", e.target.value)}
                          />
                        ) : (
                          current.dataFechamento
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            value={current.valorFechado || ""}
                            onChange={(e) => handleEditingChange("valorFechado", e.target.value)}
                          />
                        ) : (
                          current.valorFechado
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {isEditing ? (
                          <Input
                            className="h-8 text-xs"
                            value={current.observacao || ""}
                            onChange={(e) => handleEditingChange("observacao", e.target.value)}
                          />
                        ) : (
                          current.observacao
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full px-2 text-[11px]"
                              onClick={handleCancelEdit}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 rounded-full px-2 text-[11px]"
                              onClick={handleSaveEdit}
                            >
                              Salvar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full px-2 text-[11px]"
                              onClick={() => handleStartEdit(lead)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-full px-2 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption className="text-xs">
                Dica: use este painel todos os dias para garantir que nenhum lead fique sem retorno.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LeadsV2Page;
