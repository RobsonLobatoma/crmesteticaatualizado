import { useState, useMemo, useEffect } from "react";
import { BarChart3, PlusCircle, Loader2, Kanban } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "./types/Lead";
import { useLeads } from "./hooks/useLeads";
import { useLeadTags } from "./hooks/useLeadTags";
import { fetchAddressByCep, formatCep, formatCpf } from "./utils/cepUtils";
import { TagsManager } from "./components/TagsManager";
import { TagsSelector, TagsBadges } from "./components/TagsSelector";
import { ColumnManager, ColumnConfig, loadColumnConfig, DEFAULT_COLUMNS } from "./components/ColumnManager";
import { supabase } from "@/integrations/supabase/client";
import { useCRMStatuses } from "@/modules/kanbam-v2/hooks/useCRMStatuses";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const LeadsV2Page = () => {
  const { toast } = useToast();
  const { leads, createLead, updateLead, deleteLead } = useLeads();
  const { tags: availableTags, refresh: refreshTags } = useLeadTags();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newLead, setNewLead] = useState<Omit<Lead, "id" | "status"> & { status?: string }>({
    dataEntrada: "",
    responsavel: "",
    nome: "",
    contato: "",
    origem: "",
    procedimento: "",
    dataUltimoContato: "",
    dataAgendamento: "",
    dataAvaliacao: "",
    dataProcedimento: "",
    compareceu: "",
    dataFechamento: "",
    valorFechado: "",
    observacao: "",
    status: "Novo lead",
    // Novos campos
    dataNascimento: "",
    cpf: "",
    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: "",
    tags: [],
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [editingCepLoading, setEditingCepLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [responsavelFilter, setResponsavelFilter] = useState<string>("");
  const [origemFilter, setOrigemFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [isHojeDetailOpen, setIsHojeDetailOpen] = useState(false);
  const [hojeCurrentPage, setHojeCurrentPage] = useState(1);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [hojeSearchFilter, setHojeSearchFilter] = useState("");
  const [tableSearchFilter, setTableSearchFilter] = useState("");
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(() => loadColumnConfig());
  const LEADS_PER_PAGE = 10;

  // Helper to check if a column is visible
  const isColumnVisible = (id: string) => {
    const col = columnConfig.find((c) => c.id === id);
    return col ? col.visible : true;
  };

  // Get column order based on config
  const getColumnOrder = (id: string) => {
    const idx = columnConfig.findIndex((c) => c.id === id);
    return idx >= 0 ? idx : 999;
  };
  
  // Usar status do CRM
  const { statuses: crmStatuses } = useCRMStatuses();

  const handleChange = (field: keyof typeof newLead, value: string) => {
    setNewLead((prev) => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    handleChange("cep", formattedCep);

    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const address = await fetchAddressByCep(cleanCep);
        if (address) {
          setNewLead((prev) => ({
            ...prev,
            endereco: address.logradouro,
            bairro: address.bairro,
            cidade: address.localidade,
            estado: address.uf,
          }));
        }
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCpfChange = (value: string) => {
    const formattedCpf = formatCpf(value);
    handleChange("cpf", formattedCpf);
  };

  const handleEditingChange = (field: keyof Lead, value: string) => {
    setEditingLead((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleEditingCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    handleEditingChange("cep", formattedCep);

    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setEditingCepLoading(true);
      try {
        const address = await fetchAddressByCep(cleanCep);
        if (address && editingLead) {
          setEditingLead((prev) => prev ? {
            ...prev,
            endereco: address.logradouro,
            bairro: address.bairro,
            cidade: address.localidade,
            estado: address.uf,
          } : prev);
        }
      } finally {
        setEditingCepLoading(false);
      }
    }
  };

  const handleEditingCpfChange = (value: string) => {
    const formattedCpf = formatCpf(value);
    handleEditingChange("cpf", formattedCpf);
  };

  // Função para transferir lead com status "Fechou" para tabela clients
  const transferToClients = async (lead: Lead) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verificar se já existe cliente com mesmo telefone
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('phone', lead.contato)
      .maybeSingle();

    if (existingClient) {
      toast({
        title: "Cliente já existe",
        description: "Este contato já está cadastrado como cliente.",
      });
      return;
    }

    // Montar endereço completo
    const addressParts = [
      lead.endereco,
      lead.numero ? `Nº ${lead.numero}` : null,
      lead.complemento,
      lead.bairro,
      lead.cidade && lead.estado ? `${lead.cidade}/${lead.estado}` : lead.cidade || lead.estado,
    ].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;

    const { error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: lead.nome,
        phone: lead.contato,
        cpf: lead.cpf || null,
        birth_date: lead.dataNascimento || null,
        address: fullAddress,
        notes: lead.observacao || null,
      });

    if (!error) {
      toast({
        title: "Cliente criado!",
        description: `${lead.nome} foi adicionado à lista de clientes.`,
      });
    }
  };

  // Função para enviar lead para o Kanban
  const sendToKanban = async (lead: Lead) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado.",
        variant: "destructive",
      });
      return;
    }

    // Mapear status do lead para slug do CRM
    const statusMap: Record<string, string> = {
      'Novo lead': 'novo',
      'Novo(hoje)': 'novo',
      'Em Atendimento': 'em_atendimento',
      'Qualificado': 'qualificacao',
      'Não Qualificado': 'perdido',
      'Avaliação Confirmada': 'aguardando',
      'Compareceu': 'em_atendimento',
      'Faltou': 'voltar',
      'Proposta Enviada': 'qualificacao',
      'Fechou': 'fechou',
      'Não Fechou': 'perdido',
      'Pós Venda': 'fechou',
      'Indicação': 'novo',
    };

    const crmStatus = statusMap[lead.status] || 'novo';

    // Verificar se já existe no Kanban
    const { data: existing } = await supabase
      .from('crm_clients')
      .select('id')
      .eq('lead_id', lead.id)
      .maybeSingle();

    if (existing) {
      toast({
        title: "Lead já no Kanban",
        description: "Este lead já foi enviado para o quadro de atendimento.",
      });
      return;
    }

    const { error } = await supabase
      .from('crm_clients')
      .insert({
        user_id: user.id,
        lead_id: lead.id,
        nome: lead.nome,
        telefone: lead.contato,
        status: crmStatus,
        responsavel: lead.responsavel || null,
        origem: lead.origem || null,
        tags: lead.tags || [],
        observacoes: lead.observacao || null,
        total_mensagens: 0,
        mensagens_nao_lidas: 0,
        urgente: false,
      });

    if (!error) {
      toast({
        title: "Enviado para Kanban!",
        description: `${lead.nome} foi adicionado ao quadro de atendimento.`,
      });
    } else {
      toast({
        title: "Erro ao enviar para Kanban",
        description: error.message,
        variant: "destructive",
      });
    }
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

    // Normaliza strings vazias para undefined
    const normalize = (val: string | undefined) => (val && val.trim() !== "" ? val : undefined);

    try {
      await createLead({
        nome: newLead.nome,
        contato: newLead.contato,
        responsavel: normalize(newLead.responsavel) || "-",
        origem: normalize(newLead.origem) || "Manual",
        procedimento: normalize(newLead.procedimento),
        status: normalize(newLead.status) || "Novo(hoje)",
        dataEntrada: normalize(newLead.dataEntrada),
        dataUltimoContato: normalize(newLead.dataUltimoContato),
        dataAgendamento: normalize(newLead.dataAgendamento),
        dataAvaliacao: normalize(newLead.dataAvaliacao),
        dataProcedimento: normalize(newLead.dataProcedimento),
        compareceu: normalize(newLead.compareceu),
        dataFechamento: normalize(newLead.dataFechamento),
        valorFechado: normalize(newLead.valorFechado),
        observacao: normalize(newLead.observacao),
        dataNascimento: normalize(newLead.dataNascimento),
        cpf: normalize(newLead.cpf),
        cep: normalize(newLead.cep),
        endereco: normalize(newLead.endereco),
        numero: normalize(newLead.numero),
        bairro: normalize(newLead.bairro),
        cidade: normalize(newLead.cidade),
        estado: normalize(newLead.estado),
        complemento: normalize(newLead.complemento),
        tags: selectedTags,
      });

      // Se status for "Fechou", transferir para clientes automaticamente
      if (newLead.status === "Fechou") {
        // Buscar o lead recém criado (último com esse nome e contato)
        const { data: newLeads } = await supabase
          .from('leads')
          .select('*')
          .eq('nome', newLead.nome)
          .eq('contato', newLead.contato)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (newLeads && newLeads.length > 0) {
          const createdLead: Lead = {
            id: newLeads[0].id,
            nome: newLeads[0].nome,
            contato: newLeads[0].contato,
            responsavel: newLeads[0].responsavel || '-',
            origem: newLeads[0].origem || 'Manual',
            procedimento: newLeads[0].procedimento || '',
            status: newLeads[0].status,
            dataEntrada: newLeads[0].data_entrada || '',
            cpf: newLeads[0].cpf || '',
            endereco: newLeads[0].endereco || '',
            bairro: newLeads[0].bairro || '',
            cidade: newLeads[0].cidade || '',
            estado: newLeads[0].estado || '',
            numero: newLeads[0].numero || '',
            complemento: newLeads[0].complemento || '',
            observacao: newLeads[0].observacao || '',
            tags: newLeads[0].tags || [],
          };
          await transferToClients(createdLead);
        }
      }

      setNewLead({
        dataEntrada: "",
        responsavel: "",
        nome: "",
        contato: "",
        origem: "",
        procedimento: "",
        dataUltimoContato: "",
        dataAgendamento: "",
        dataAvaliacao: "",
        dataProcedimento: "",
        compareceu: "",
        dataFechamento: "",
        valorFechado: "",
        observacao: "",
        status: "Novo(hoje)",
        dataNascimento: "",
        cpf: "",
        cep: "",
        endereco: "",
        bairro: "",
        cidade: "",
        estado: "",
        numero: "",
        complemento: "",
        tags: [],
      });
      setSelectedTags([]);
    } catch {
      // Os toasts de erro já são tratados dentro do hook useLeads
    }
  };

  const handleStartEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setEditingLead(lead);
    setEditingTags(lead.tags || []);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingLead(null);
    setEditingTags([]);
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

    // Verificar se o status mudou para "Fechou"
    const originalLead = leads.find(l => l.id === editingId);
    const statusChangedToFechou = originalLead?.status !== "Fechou" && editingLead.status === "Fechou";

    try {
      await updateLead({ ...editingLead, tags: editingTags });
      
      // Se status mudou para "Fechou", transferir para clientes
      if (statusChangedToFechou) {
        await transferToClients({ ...editingLead, tags: editingTags });
      }

      setEditingId(null);
      setEditingLead(null);
      setEditingTags([]);
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
    isToday(lead.dataEntrada),
  );
  const leadsHoje = leadsHojeLista.length;

  // Filtro de pesquisa para leads de hoje
  const filteredHojeLeads = useMemo(() => {
    if (!hojeSearchFilter.trim()) return leadsHojeLista;
    const searchLower = hojeSearchFilter.toLowerCase().trim();
    return leadsHojeLista.filter((lead) =>
      lead.nome.toLowerCase().includes(searchLower) ||
      lead.contato.toLowerCase().includes(searchLower)
    );
  }, [leadsHojeLista, hojeSearchFilter]);

  // Paginação para leads de hoje
  const totalHojePages = Math.ceil(filteredHojeLeads.length / LEADS_PER_PAGE);
  const paginatedHojeLeads = useMemo(() => {
    const startIndex = (hojeCurrentPage - 1) * LEADS_PER_PAGE;
    return filteredHojeLeads.slice(startIndex, startIndex + LEADS_PER_PAGE);
  }, [filteredHojeLeads, hojeCurrentPage]);

  // Função de normalização para pesquisa
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const normalizePhone = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchStatus = statusFilter ? lead.status === statusFilter : true;
      const matchResponsavel = responsavelFilter ? lead.responsavel === responsavelFilter : true;
      const matchOrigem = origemFilter ? lead.origem === origemFilter : true;
      const matchDateRange = startDateFilter || endDateFilter
        ? isWithinRange(lead.dataEntrada, startDateFilter, endDateFilter)
        : true;

      // Filtro de pesquisa por nome ou telefone
      let matchSearch = true;
      if (tableSearchFilter.trim()) {
        const searchTerm = normalizeText(tableSearchFilter.trim());
        const searchDigits = normalizePhone(tableSearchFilter);
        const matchNome = normalizeText(lead.nome).includes(searchTerm);
        const matchContato = normalizeText(lead.contato).includes(searchTerm);
        const matchContatoDigits = searchDigits.length >= 3 && normalizePhone(lead.contato).includes(searchDigits);
        matchSearch = matchNome || matchContato || matchContatoDigits;
      }

      return matchStatus && matchResponsavel && matchOrigem && matchDateRange && matchSearch;
    });
  }, [leads, statusFilter, responsavelFilter, origemFilter, startDateFilter, endDateFilter, tableSearchFilter]);

  // Paginação para tabela principal
  const totalTablePages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);
  const paginatedFilteredLeads = useMemo(() => {
    const startIndex = (tableCurrentPage - 1) * LEADS_PER_PAGE;
    return filteredLeads.slice(startIndex, startIndex + LEADS_PER_PAGE);
  }, [filteredLeads, tableCurrentPage]);

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

      <Dialog open={isHojeDetailOpen} onOpenChange={(open) => {
        setIsHojeDetailOpen(open);
        if (!open) {
          setHojeCurrentPage(1);
          setHojeSearchFilter("");
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Leads cadastrados hoje</DialogTitle>
            <DialogDescription>
              Lista de todos os leads cadastrados na data de hoje ({leadsHoje} {leadsHoje === 1 ? 'lead' : 'leads'}).
            </DialogDescription>
          </DialogHeader>

          {/* Filtro de pesquisa */}
          <div className="flex items-center gap-2 pb-2">
            <Input
              placeholder="Pesquisar por nome ou telefone..."
              value={hojeSearchFilter}
              onChange={(e) => {
                setHojeSearchFilter(e.target.value);
                setHojeCurrentPage(1);
              }}
              className="max-w-sm h-9 text-sm"
            />
            {hojeSearchFilter && (
              <span className="text-xs text-muted-foreground">
                {filteredHojeLeads.length} resultado(s)
              </span>
            )}
          </div>

          {leadsHojeLista.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum lead cadastrado hoje.</p>
          ) : filteredHojeLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum lead encontrado com essa pesquisa.</p>
          ) : (
            <TooltipProvider>
              <div className="flex flex-col flex-1 min-h-0">
                {/* Tabela com scroll */}
                <div className="flex-1 overflow-auto border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="text-[11px] w-12 text-center">#</TableHead>
                        <TableHead className="text-[11px]">Nome</TableHead>
                        <TableHead className="text-[11px]">Contato</TableHead>
                        <TableHead className="text-[11px]">Responsável</TableHead>
                        <TableHead className="text-[11px]">Origem</TableHead>
                        <TableHead className="text-[11px]">Status</TableHead>
                        <TableHead className="text-[11px]">Tags</TableHead>
                        <TableHead className="text-[11px]">Data entrada</TableHead>
                        <TableHead className="text-[11px]" title="Objeção / Observação">Obs.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHojeLeads.map((lead, index) => {
                        const globalIndex = (hojeCurrentPage - 1) * LEADS_PER_PAGE + index + 1;
                        return (
                          <TableRow key={lead.id} className="h-10">
                            <TableCell className="text-[11px] font-semibold text-center text-primary">
                              {globalIndex}
                            </TableCell>
                            <TableCell className="text-[11px] font-medium">{lead.nome}</TableCell>
                            <TableCell className="text-[11px]">{lead.contato}</TableCell>
                            <TableCell className="text-[11px]">{lead.responsavel}</TableCell>
                            <TableCell className="text-[11px]">{lead.origem}</TableCell>
                            <TableCell className="text-[11px]">
                              <Badge variant="outline" className="text-[10px]">
                                {lead.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[11px]">
                              <TagsBadges tags={availableTags} tagIds={lead.tags || []} maxVisible={2} size="xs" />
                            </TableCell>
                            <TableCell className="text-[11px]">{lead.dataEntrada}</TableCell>
                            <TableCell className="text-[11px] max-w-[120px]">
                              {lead.observacao ? (
                                <Tooltip delayDuration={200}>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate cursor-help">
                                      {lead.observacao}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    side="top" 
                                    align="center"
                                    className="z-[9999] max-w-[320px] max-h-[200px] overflow-auto whitespace-pre-wrap break-words"
                                  >
                                    <p className="text-xs">{lead.observacao}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Barra de paginação sempre visível */}
                <div className="flex items-center justify-between border-t pt-4 mt-4 shrink-0">
                  <p className="text-xs text-muted-foreground">
                    Mostrando {Math.min((hojeCurrentPage - 1) * LEADS_PER_PAGE + 1, filteredHojeLeads.length)} a {Math.min(hojeCurrentPage * LEADS_PER_PAGE, filteredHojeLeads.length)} de {filteredHojeLeads.length} {filteredHojeLeads.length === 1 ? 'lead' : 'leads'}
                  </p>
                  {totalHojePages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setHojeCurrentPage(p => Math.max(1, p - 1))}
                            className={hojeCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalHojePages }, (_, i) => i + 1).map((page) => {
                          const showPage = page === 1 || 
                                          page === totalHojePages || 
                                          Math.abs(page - hojeCurrentPage) <= 1;
                          const showEllipsisBefore = page === hojeCurrentPage - 2 && hojeCurrentPage > 3;
                          const showEllipsisAfter = page === hojeCurrentPage + 2 && hojeCurrentPage < totalHojePages - 2;
                          
                          if (showEllipsisBefore || showEllipsisAfter) {
                            return (
                              <PaginationItem key={`ellipsis-${page}`}>
                                <span className="px-2 text-muted-foreground">...</span>
                              </PaginationItem>
                            );
                          }
                          
                          if (!showPage) return null;
                          
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setHojeCurrentPage(page)}
                                isActive={hojeCurrentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setHojeCurrentPage(p => Math.min(totalHojePages, p + 1))}
                            className={hojeCurrentPage === totalHojePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </div>
            </TooltipProvider>
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
              <div className="flex items-center gap-2">
                <TagsManager onTagsChange={refreshTags} />
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
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Entrada</label>
                <Input
                  type="date"
                  value={newLead.dataEntrada}
                  onChange={(e) => handleChange("dataEntrada", e.target.value)}
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
                  {crmStatuses.length > 0 ? (
                    crmStatuses.map((status) => (
                      <option key={status.id} value={status.name}>{status.name}</option>
                    ))
                  ) : (
                    <>
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
                    </>
                  )}
                </select>
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
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Procedimento</label>
                <Input
                  type="date"
                  value={newLead.dataProcedimento}
                  onChange={(e) => handleChange("dataProcedimento", e.target.value)}
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
                  type="text"
                  placeholder="Ex: R$ 1.500,00"
                  value={newLead.valorFechado}
                  onChange={(e) => handleChange("valorFechado", e.target.value)}
                />
              </div>
              
              {/* Novos campos de endereço */}
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data de Nascimento</label>
                <Input
                  type="date"
                  value={newLead.dataNascimento}
                  onChange={(e) => handleChange("dataNascimento", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">CPF</label>
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={newLead.cpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">CEP</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="00000-000"
                    maxLength={9}
                    value={newLead.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                  />
                  {cepLoading && (
                    <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Endereço</label>
                <Input
                  type="text"
                  placeholder="Rua, Avenida..."
                  value={newLead.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Número</label>
                <Input
                  type="text"
                  placeholder="Nº"
                  value={newLead.numero}
                  onChange={(e) => handleChange("numero", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Bairro</label>
                <Input
                  type="text"
                  placeholder="Bairro"
                  value={newLead.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Cidade</label>
                <Input
                  type="text"
                  placeholder="Cidade"
                  value={newLead.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Estado</label>
                <Input
                  type="text"
                  placeholder="UF"
                  maxLength={2}
                  value={newLead.estado}
                  onChange={(e) => handleChange("estado", e.target.value.toUpperCase())}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Complemento</label>
                <Input
                  type="text"
                  placeholder="Apto, Bloco..."
                  value={newLead.complemento}
                  onChange={(e) => handleChange("complemento", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tags</label>
                <TagsSelector
                  availableTags={availableTags}
                  selectedTagIds={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Selecionar tags..."
                />
              </div>
              <div className="md:col-span-3 lg:col-span-4">
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
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">Pesquisar</span>
              <Input
                type="text"
                placeholder="Nome ou telefone..."
                className="h-8 min-w-[180px] text-[11px]"
                value={tableSearchFilter}
                onChange={(e) => {
                  setTableSearchFilter(e.target.value);
                  setTableCurrentPage(1);
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-auto h-8 rounded-full px-3 text-[11px]"
              onClick={() => {
                setStatusFilter("");
                setResponsavelFilter("");
                setOrigemFilter("");
                setStartDateFilter("");
                setEndDateFilter("");
                setTableSearchFilter("");
                setTableCurrentPage(1);
              }}
            >
              Limpar filtros
            </Button>
            <Button variant="outline" size="sm" className="mt-1 h-8 rounded-full px-3 text-[11px]">
              Exportar planilha
            </Button>
            <ColumnManager columns={columnConfig} onChange={setColumnConfig} />
          </div>
        </div>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardContent className="pt-4 pb-2">
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow>
                      {isColumnVisible("#") && <TableHead className="w-12 text-center" style={{ order: getColumnOrder("#") }}>#</TableHead>}
                      {isColumnVisible("dataEntrada") && <TableHead style={{ order: getColumnOrder("dataEntrada") }}>Data Entrada</TableHead>}
                      {isColumnVisible("responsavel") && <TableHead style={{ order: getColumnOrder("responsavel") }}>Responsável</TableHead>}
                      {isColumnVisible("nome") && <TableHead style={{ order: getColumnOrder("nome") }}>Nome do Cliente</TableHead>}
                      {isColumnVisible("contato") && <TableHead style={{ order: getColumnOrder("contato") }}>Contato WhatsApp/@</TableHead>}
                      {isColumnVisible("origem") && <TableHead style={{ order: getColumnOrder("origem") }}>Origem</TableHead>}
                      {isColumnVisible("procedimento") && <TableHead style={{ order: getColumnOrder("procedimento") }}>Procedimento / Interesse</TableHead>}
                      {isColumnVisible("status") && <TableHead style={{ order: getColumnOrder("status") }}>Status</TableHead>}
                      {isColumnVisible("dataUltimoContato") && <TableHead style={{ order: getColumnOrder("dataUltimoContato") }}>Data Último Contato</TableHead>}
                      {isColumnVisible("dataAgendamento") && <TableHead style={{ order: getColumnOrder("dataAgendamento") }}>Data Agendamento (quando marcou)</TableHead>}
                      {isColumnVisible("dataAvaliacao") && <TableHead style={{ order: getColumnOrder("dataAvaliacao") }}>Data Avaliação (dia marcado)</TableHead>}
                      {isColumnVisible("dataProcedimento") && <TableHead style={{ order: getColumnOrder("dataProcedimento") }}>Data Procedimento</TableHead>}
                      {isColumnVisible("compareceu") && <TableHead style={{ order: getColumnOrder("compareceu") }}>Compareceu?</TableHead>}
                      {isColumnVisible("dataFechamento") && <TableHead style={{ order: getColumnOrder("dataFechamento") }}>Data Fechamento</TableHead>}
                      {isColumnVisible("valorFechado") && <TableHead style={{ order: getColumnOrder("valorFechado") }}>Valor Fechado (R$)</TableHead>}
                      {isColumnVisible("dataNascimento") && <TableHead style={{ order: getColumnOrder("dataNascimento") }}>Data de Nascimento</TableHead>}
                      {isColumnVisible("cpf") && <TableHead style={{ order: getColumnOrder("cpf") }}>CPF</TableHead>}
                      {isColumnVisible("cep") && <TableHead style={{ order: getColumnOrder("cep") }}>CEP</TableHead>}
                      {isColumnVisible("endereco") && <TableHead style={{ order: getColumnOrder("endereco") }}>Endereço</TableHead>}
                      {isColumnVisible("numero") && <TableHead style={{ order: getColumnOrder("numero") }}>Número</TableHead>}
                      {isColumnVisible("bairro") && <TableHead style={{ order: getColumnOrder("bairro") }}>Bairro</TableHead>}
                      {isColumnVisible("cidade") && <TableHead style={{ order: getColumnOrder("cidade") }}>Cidade</TableHead>}
                      {isColumnVisible("estado") && <TableHead style={{ order: getColumnOrder("estado") }}>Estado</TableHead>}
                      {isColumnVisible("complemento") && <TableHead style={{ order: getColumnOrder("complemento") }}>Complemento</TableHead>}
                      {isColumnVisible("tags") && <TableHead style={{ order: getColumnOrder("tags") }}>Tags</TableHead>}
                      {isColumnVisible("observacao") && <TableHead style={{ order: getColumnOrder("observacao") }}>Objeção / Observação</TableHead>}
                      {isColumnVisible("acoes") && <TableHead className="w-[1%] whitespace-nowrap text-right" style={{ order: getColumnOrder("acoes") }}>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFilteredLeads.map((lead, index) => {
                      const globalIndex = (tableCurrentPage - 1) * LEADS_PER_PAGE + index + 1;
                      const isEditing = editingId === lead.id;
                      const current = isEditing && editingLead ? editingLead : lead;

                      return (
                        <TableRow key={lead.id} className="hover:bg-muted/40">
                          {isColumnVisible("#") && (
                            <TableCell className="text-center text-xs font-semibold text-primary" style={{ order: getColumnOrder("#") }}>
                              {globalIndex}
                            </TableCell>
                          )}
                          {isColumnVisible("dataEntrada") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("dataEntrada") }}>
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
                          )}
                          {isColumnVisible("responsavel") && (
                            <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground" style={{ order: getColumnOrder("responsavel") }}>
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
                          )}
                          {isColumnVisible("nome") && (
                            <TableCell style={{ order: getColumnOrder("nome") }}>
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
                          )}
                          {isColumnVisible("contato") && (
                            <TableCell className="whitespace-nowrap text-xs" style={{ order: getColumnOrder("contato") }}>
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
                          )}
                          {isColumnVisible("origem") && (
                            <TableCell style={{ order: getColumnOrder("origem") }}>
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
                          )}
                          {isColumnVisible("procedimento") && (
                            <TableCell style={{ order: getColumnOrder("procedimento") }}>
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
                          )}
                          {isColumnVisible("status") && (
                            <TableCell style={{ order: getColumnOrder("status") }}>
                              {isEditing ? (
                                <select
                                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground shadow-sm"
                                  value={current.status}
                                  onChange={(e) => handleEditingChange("status", e.target.value)}
                                >
                                  {crmStatuses.length > 0 ? (
                                    crmStatuses.map((status) => (
                                      <option key={status.id} value={status.name}>{status.name}</option>
                                    ))
                                  ) : (
                                    <>
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
                                    </>
                                  )}
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
                          )}
                          {isColumnVisible("dataUltimoContato") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("dataUltimoContato") }}>
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
                          )}
                          {isColumnVisible("dataAgendamento") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("dataAgendamento") }}>
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
                          )}
                          {isColumnVisible("dataAvaliacao") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("dataAvaliacao") }}>
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
                          )}
                          {isColumnVisible("dataProcedimento") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("dataProcedimento") }}>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  className="h-8 text-xs"
                                  value={current.dataProcedimento || ""}
                                  onChange={(e) => handleEditingChange("dataProcedimento", e.target.value)}
                                />
                              ) : (
                                current.dataProcedimento
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("compareceu") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("compareceu") }}>
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
                          )}
                          {isColumnVisible("dataFechamento") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("dataFechamento") }}>
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
                          )}
                          {isColumnVisible("valorFechado") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("valorFechado") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  value={current.valorFechado || ""}
                                  onChange={(e) => handleEditingChange("valorFechado", e.target.value)}
                                />
                              ) : (
                                current.valorFechado
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("dataNascimento") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("dataNascimento") }}>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  className="h-8 text-xs"
                                  value={current.dataNascimento || ""}
                                  onChange={(e) => handleEditingChange("dataNascimento", e.target.value)}
                                />
                              ) : (
                                current.dataNascimento
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("cpf") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("cpf") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  placeholder="000.000.000-00"
                                  maxLength={14}
                                  value={current.cpf || ""}
                                  onChange={(e) => handleEditingCpfChange(e.target.value)}
                                />
                              ) : (
                                current.cpf
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("cep") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("cep") }}>
                              {isEditing ? (
                                <div className="relative">
                                  <Input
                                    type="text"
                                    className="h-8 text-xs"
                                    placeholder="00000-000"
                                    maxLength={9}
                                    value={current.cep || ""}
                                    onChange={(e) => handleEditingCepChange(e.target.value)}
                                  />
                                  {editingCepLoading && (
                                    <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                  )}
                                </div>
                              ) : (
                                current.cep ? formatCep(current.cep) : ""
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("endereco") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("endereco") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  value={current.endereco || ""}
                                  onChange={(e) => handleEditingChange("endereco", e.target.value)}
                                />
                              ) : (
                                current.endereco
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("numero") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("numero") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  value={current.numero || ""}
                                  onChange={(e) => handleEditingChange("numero", e.target.value)}
                                />
                              ) : (
                                current.numero
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("bairro") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("bairro") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  value={current.bairro || ""}
                                  onChange={(e) => handleEditingChange("bairro", e.target.value)}
                                />
                              ) : (
                                current.bairro
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("cidade") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("cidade") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  value={current.cidade || ""}
                                  onChange={(e) => handleEditingChange("cidade", e.target.value)}
                                />
                              ) : (
                                current.cidade
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("estado") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("estado") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  maxLength={2}
                                  value={current.estado || ""}
                                  onChange={(e) => handleEditingChange("estado", e.target.value.toUpperCase())}
                                />
                              ) : (
                                current.estado
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("complemento") && (
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground" style={{ order: getColumnOrder("complemento") }}>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  className="h-8 text-xs"
                                  value={current.complemento || ""}
                                  onChange={(e) => handleEditingChange("complemento", e.target.value)}
                                />
                              ) : (
                                current.complemento
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("tags") && (
                            <TableCell className="whitespace-nowrap text-xs" style={{ order: getColumnOrder("tags") }}>
                              {isEditing ? (
                                <TagsSelector
                                  availableTags={availableTags}
                                  selectedTagIds={editingTags}
                                  onChange={setEditingTags}
                                  className="w-[200px]"
                                />
                              ) : (
                                <TagsBadges tags={availableTags} tagIds={current.tags || []} maxVisible={2} size="xs" />
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("observacao") && (
                            <TableCell className="max-w-[220px] text-xs text-muted-foreground" style={{ order: getColumnOrder("observacao") }}>
                              {isEditing ? (
                                <Input
                                  className="h-8 text-xs"
                                  value={current.observacao || ""}
                                  onChange={(e) => handleEditingChange("observacao", e.target.value)}
                                />
                              ) : current.observacao ? (
                                <TooltipProvider>
                                  <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                      <span 
                                        className="block truncate cursor-help" 
                                        title={current.observacao}
                                      >
                                        {current.observacao}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent 
                                      side="top" 
                                      align="center"
                                      className="z-[9999] max-w-[320px] max-h-[200px] overflow-auto whitespace-pre-wrap break-words"
                                    >
                                      <p className="text-xs">{current.observacao}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )}
                          {isColumnVisible("acoes") && (
                            <TableCell className="whitespace-nowrap text-right" style={{ order: getColumnOrder("acoes") }}>
                              {isEditing ? (
                                <div className="flex justify-end gap-1">
                                  <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={handleCancelEdit}>
                                    Cancelar
                                  </Button>
                                  <Button size="sm" className="h-8 px-2 text-xs" onClick={handleSaveEdit}>
                                    Salvar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 px-2 text-xs bg-green-100 text-green-800 hover:bg-green-200"
                                    onClick={() => sendToKanban(lead)}
                                  >
                                    Kanban
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-xs"
                                    onClick={() => handleStartEdit(lead)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-xs text-destructive"
                                    onClick={() => handleDeleteLead(lead.id)}
                                  >
                                    Remover
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Barra de paginação sempre visível */}
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <p className="text-xs text-muted-foreground">
                Mostrando {Math.min((tableCurrentPage - 1) * LEADS_PER_PAGE + 1, filteredLeads.length)} a {Math.min(tableCurrentPage * LEADS_PER_PAGE, filteredLeads.length)} de {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
              </p>
              {totalTablePages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setTableCurrentPage(p => Math.max(1, p - 1))}
                        className={tableCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalTablePages }, (_, i) => i + 1).map((page) => {
                      const showPage = page === 1 || 
                                      page === totalTablePages || 
                                      Math.abs(page - tableCurrentPage) <= 1;
                      
                      if (!showPage) {
                        if (page === 2 && tableCurrentPage > 3) {
                          return <PaginationItem key={`ellipsis-start`}><span className="px-2 text-muted-foreground">...</span></PaginationItem>;
                        }
                        if (page === totalTablePages - 1 && tableCurrentPage < totalTablePages - 2) {
                          return <PaginationItem key={`ellipsis-end`}><span className="px-2 text-muted-foreground">...</span></PaginationItem>;
                        }
                        return null;
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setTableCurrentPage(page)}
                            isActive={tableCurrentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setTableCurrentPage(p => Math.min(totalTablePages, p + 1))}
                        className={tableCurrentPage === totalTablePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
            
            <p className="mt-3 text-center text-xs text-muted-foreground border-t pt-3">
              Dica: use este painel todos os dias para garantir que nenhum lead fique sem retorno.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LeadsV2Page;
