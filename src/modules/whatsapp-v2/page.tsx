import { useMemo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatList } from "./ChatList";
import { MessageBubble } from "./MessageBubble";
import { SendMessageBox } from "./SendMessageBox";
import { QRCodeModal } from "./QRCodeModal";
import { InstanceFormModal } from "./components/InstanceFormModal";
import { InstanceCard } from "./components/InstanceCard";
import { TemplateFormModal } from "./components/TemplateFormModal";
import { useEvolutionInstances } from "./hooks/useEvolutionInstances";
import { useWhatsappChats } from "./hooks/useWhatsappChats";
import { useWhatsappMessages } from "./hooks/useWhatsappMessages";
import { useSendMessage } from "./hooks/useSendMessage";
import { useWhatsappTemplates } from "./hooks/useWhatsappTemplates";
import { useCRMClients } from "@/modules/kanbam-v2/hooks/useCRMClients";
import { useCRMStatuses } from "@/modules/kanbam-v2/hooks/useCRMStatuses";
import { useLeads } from "@/modules/leads-v2/hooks/useLeads";
import { useLeadTags } from "@/modules/leads-v2/hooks/useLeadTags";
import { fetchAddressByCep, formatCep, formatCpf } from "@/modules/leads-v2/utils/cepUtils";
import { TagsSelector } from "@/modules/leads-v2/components/TagsSelector";
import { useClients } from "@/modules/agenda-v2/hooks/useClients";
import { useProfessionals } from "@/modules/agenda-v2/hooks/useProfessionals";
import { useServices } from "@/modules/agenda-v2/hooks/useResources";
import { useAppointments } from "@/modules/agenda-v2/hooks/useAppointments";
import { WhatsappTemplate, EvolutionInstanceConfig } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, RefreshCw, Trash2, AlertTriangle, Kanban, CheckCircle2, UserPlus, Calendar, ClipboardList, X } from "lucide-react";
import { format, addMinutes } from "date-fns";

const WhatsappV2Page = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { clients: crmClients } = useCRMClients();
  const { statuses: crmStatuses } = useCRMStatuses();
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [sendingToKanban, setSendingToKanban] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>(undefined);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [qrInstance, setQrInstance] = useState<EvolutionInstanceConfig | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  // Quick Lead Form state
  const [showQuickLeadForm, setShowQuickLeadForm] = useState(false);
  const { createLead } = useLeads();
  const { tags: availableTags } = useLeadTags();
  const [quickLeadSelectedTags, setQuickLeadSelectedTags] = useState<string[]>([]);
  const [quickLeadCepLoading, setQuickLeadCepLoading] = useState(false);
  const [quickLeadSaving, setQuickLeadSaving] = useState(false);
  const [quickLead, setQuickLead] = useState({
    dataEntrada: "", responsavel: "", nome: "", contato: "", email: "", origem: "WhatsApp",
    procedimento: "", status: "Novo lead", dataUltimoContato: "", dataAgendamento: "",
    dataAvaliacao: "", dataProcedimento: "", compareceu: "", dataFechamento: "",
    valorFechado: "", observacao: "", dataNascimento: "", cpf: "", cep: "",
    endereco: "", bairro: "", cidade: "", estado: "", numero: "", complemento: "",
  });

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const { professionals } = useProfessionals();
  const { data: services } = useServices();
  const { clients: agendaClients, createClient } = useClients();
  const today = new Date();
  const { createAppointment } = useAppointments(today, "day");
  const [scheduleForm, setScheduleForm] = useState({
    date: "", time: "", professionalId: "", serviceId: "", duration: "60", notes: "",
  });
  
  // Evolution Instances Management
  const {
    instances: evolutionInstances,
    isLoading: isLoadingInstances,
    createInstance,
    updateInstance,
    deleteInstance,
  } = useEvolutionInstances();
  
  const [instanceModalOpen, setInstanceModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<EvolutionInstanceConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get selected instance
  const selectedInstance = useMemo(
    () => evolutionInstances.find((i) => i.id === selectedInstanceId) || evolutionInstances[0] || null,
    [evolutionInstances, selectedInstanceId]
  );

  // Real-time chats
  const {
    chats,
    isLoading: isLoadingChats,
    error: chatsError,
    refetch: refetchChats,
  } = useWhatsappChats({
    instance: selectedInstance,
    enabled: !!selectedInstance && activeTab === "inbox",
    pollingInterval: 30000,
  });

  // Get selected chat
  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  // Real-time messages
  const {
    messages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
    addOptimisticMessage,
  } = useWhatsappMessages({
    instance: selectedInstance,
    phoneNumber: selectedChat?.phoneNumber || null,
    enabled: !!selectedInstance && !!selectedChat,
  });

  // Send message
  const { sendMessage, sendMedia, isSending } = useSendMessage({
    instance: selectedInstance,
    onSuccess: () => {
      refetchMessages();
      refetchChats();
    },
  });

  // Templates
  const {
    templates,
    isLoading: isLoadingTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleActive,
  } = useWhatsappTemplates();

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsappTemplate | null>(null);
  const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false);

  // Helper: find "Novo Lead" status slug
  const getNovoLeadSlug = () => {
    const activeStatuses = crmStatuses.filter(s => s.is_active).sort((a, b) => a.display_order - b.display_order);
    const novoStatus = activeStatuses.find(s => s.slug === 'novo_lead')
      || activeStatuses.find(s => s.name?.toLowerCase().includes('novo lead'))
      || activeStatuses.find(s => s.slug === 'novo_hoje' || s.slug === 'novo')
      || activeStatuses[0];
    return novoStatus?.slug || "novo_lead";
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChat?.phoneNumber) return false;
    addOptimisticMessage(content);
    return sendMessage(selectedChat.phoneNumber, content);
  };

  const handleOpenQr = (instance: EvolutionInstanceConfig) => {
    setQrInstance(instance);
    setQrOpen(true);
  };

  const handleOpenInstanceModal = (instance?: EvolutionInstanceConfig) => {
    setEditingInstance(instance || null);
    setInstanceModalOpen(true);
  };

  const handleInstanceSubmit = async (formData: {
    name: string;
    evolutionApiUrl: string;
    evolutionApiKey: string;
    evolutionInstanceName: string;
  }) => {
    setIsSubmitting(true);
    try {
      if (editingInstance) {
        return await updateInstance(editingInstance.id, formData);
      } else {
        return await createInstance(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    await deleteInstance(id);
  };

  const handleOpenTemplateModal = (template?: WhatsappTemplate) => {
    setEditingTemplate(template || null);
    setTemplateModalOpen(true);
  };

  const handleTemplateSubmit = async (formData: {
    name: string;
    content: string;
    type: "manual" | "automatic";
    trigger_type: "keyword" | "event";
    trigger_value: string;
    is_active: boolean;
  }) => {
    setIsTemplateSubmitting(true);
    try {
      if (editingTemplate) {
        return await updateTemplate(editingTemplate.id, formData);
      } else {
        return await createTemplate(formData);
      }
    } finally {
      setIsTemplateSubmitting(false);
    }
  };

  // Quick Lead Form handlers
  const handleQuickLeadChange = (field: string, value: string) => {
    setQuickLead(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickLeadCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    handleQuickLeadChange("cep", formattedCep);
    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setQuickLeadCepLoading(true);
      try {
        const address = await fetchAddressByCep(cleanCep);
        if (address) {
          setQuickLead(prev => ({
            ...prev,
            endereco: address.logradouro,
            bairro: address.bairro,
            cidade: address.localidade,
            estado: address.uf,
          }));
        }
      } finally {
        setQuickLeadCepLoading(false);
      }
    }
  };

  const handleQuickLeadCpfChange = (value: string) => {
    handleQuickLeadChange("cpf", formatCpf(value));
  };

  const openQuickLeadForm = () => {
    setQuickLead({
      dataEntrada: format(new Date(), "yyyy-MM-dd"),
      responsavel: "", 
      nome: selectedChat?.leadName || "",
      contato: selectedChat?.phoneNumber || "",
      email: "",
      origem: "WhatsApp",
      procedimento: "", status: "Novo lead", dataUltimoContato: "", dataAgendamento: "",
      dataAvaliacao: "", dataProcedimento: "", compareceu: "", dataFechamento: "",
      valorFechado: "", observacao: "", dataNascimento: "", cpf: "", cep: "",
      endereco: "", bairro: "", cidade: "", estado: "", numero: "", complemento: "",
    });
    setQuickLeadSelectedTags([]);
    setShowQuickLeadForm(true);
  };

  const handleSaveQuickLead = async () => {
    if (!quickLead.nome || !quickLead.contato) {
      toast({ title: "Preencha os campos obrigatórios", description: "Nome e contato são obrigatórios.", variant: "destructive" });
      return;
    }
    setQuickLeadSaving(true);
    try {
      const normalize = (val: string) => (val && val.trim() !== "" ? val : undefined);
      await createLead({
        nome: quickLead.nome,
        contato: quickLead.contato,
        responsavel: normalize(quickLead.responsavel) || "-",
        origem: normalize(quickLead.origem) || "WhatsApp",
        procedimento: normalize(quickLead.procedimento),
        status: normalize(quickLead.status) || "Novo lead",
        dataEntrada: normalize(quickLead.dataEntrada),
        dataUltimoContato: normalize(quickLead.dataUltimoContato),
        dataAgendamento: normalize(quickLead.dataAgendamento),
        dataAvaliacao: normalize(quickLead.dataAvaliacao),
        dataProcedimento: normalize(quickLead.dataProcedimento),
        compareceu: normalize(quickLead.compareceu),
        dataFechamento: normalize(quickLead.dataFechamento),
        valorFechado: normalize(quickLead.valorFechado),
        observacao: normalize(quickLead.observacao),
        dataNascimento: normalize(quickLead.dataNascimento),
        cpf: normalize(quickLead.cpf),
        cep: normalize(quickLead.cep),
        endereco: normalize(quickLead.endereco),
        numero: normalize(quickLead.numero),
        bairro: normalize(quickLead.bairro),
        cidade: normalize(quickLead.cidade),
        estado: normalize(quickLead.estado),
        complemento: normalize(quickLead.complemento),
        tags: quickLeadSelectedTags,
      });
      setShowQuickLeadForm(false);
    } catch {
      // toast handled by useLeads
    } finally {
      setQuickLeadSaving(false);
    }
  };

  // Schedule handlers
  const openScheduleModal = () => {
    setScheduleForm({
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      professionalId: "",
      serviceId: "",
      duration: "60",
      notes: `Avaliação - ${selectedChat?.leadName || selectedChat?.phoneNumber || ""}`,
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      toast({ title: "Preencha data e horário", variant: "destructive" });
      return;
    }
    setScheduleSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Não autenticado");
      const userId = sessionData.session.user.id;

      // Find or create client in agenda clients table
      const phone = selectedChat?.phoneNumber || "";
      const name = selectedChat?.leadName || phone;
      let clientId: string | null = null;

      const existingClient = agendaClients.find(c => c.phone === phone);
      if (existingClient) {
        clientId = existingClient.id;
      } else if (phone) {
        // Create client
        const { data: newClient, error: clientErr } = await supabase
          .from("clients")
          .insert({ name, phone, user_id: userId })
          .select()
          .single();
        if (!clientErr && newClient) {
          clientId = newClient.id;
          queryClient.invalidateQueries({ queryKey: ["clients"] });
        }
      }

      const startDatetime = new Date(`${scheduleForm.date}T${scheduleForm.time}:00`);
      const durationMin = parseInt(scheduleForm.duration) || 60;
      const endDatetime = addMinutes(startDatetime, durationMin);

      createAppointment({
        equipment_id: null,
        recurrence_parent_id: null,
        recurrence_type: "none",
        room_id: null,
        send_sms: false,
        client_id: clientId,
        professional_id: scheduleForm.professionalId || null,
        service_id: scheduleForm.serviceId || null,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        duration_minutes: durationMin,
        notes: scheduleForm.notes || null,
        status: "agendado",
        user_id: userId,
      });

      setShowScheduleModal(false);
      toast({ title: "Avaliação agendada!", description: `Agendamento criado para ${format(startDatetime, "dd/MM/yyyy HH:mm")}` });
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro desconhecido", variant: "destructive" });
    } finally {
      setScheduleSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">WhatsApp &amp; Comunicação</h1>
            <p className="text-sm text-muted-foreground">
              Inbox unificada, múltiplas instâncias Evolution API e templates de mensagens.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedInstance && (
              <Badge variant="outline" className="rounded-full text-[11px] uppercase tracking-wide">
                {selectedInstance.name}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col gap-4">
        <TabsList className="w-fit rounded-full bg-muted/60 p-1 text-xs">
          <TabsTrigger value="inbox" className="rounded-full px-4 py-1">
            Inbox
          </TabsTrigger>
          <TabsTrigger value="instances" className="rounded-full px-4 py-1">
            Instâncias
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-full px-4 py-1">
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-4 py-1">
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* INBOX TAB */}
        <TabsContent value="inbox" className="flex flex-1 flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1.4fr)_minmax(0,1fr)] h-[calc(100vh-220px)] min-h-[500px]">
            {/* Coluna 1: Lista de Chats */}
            <div className="flex flex-col gap-2 h-full min-h-0">
              {evolutionInstances.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="text-sm font-medium mb-1">Nenhuma instância</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Configure uma instância da Evolution API para ver os chats.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("instances")}>
                    Configurar instância
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Instância</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => refetchChats()}
                      disabled={isLoadingChats}
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingChats ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                  <select
                    className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                    value={selectedInstanceId || selectedInstance?.id || ""}
                    onChange={(e) => {
                      setSelectedInstanceId(e.target.value || undefined);
                      setSelectedChatId(null);
                    }}
                  >
                    {evolutionInstances.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>

                  {chatsError ? (
                    <Alert variant="destructive" className="mx-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-xs">Erro de conexão</AlertTitle>
                      <AlertDescription className="text-xs">
                        {chatsError}
                      </AlertDescription>
                    </Alert>
                  ) : isLoadingChats ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ChatList
                      chats={chats}
                      selectedChatId={selectedChatId}
                      onSelect={setSelectedChatId}
                    />
                  )}
                </>
              )}
            </div>

            {/* Coluna 2: Área de Mensagens */}
            <div className="flex h-full min-h-[360px] flex-col rounded-xl border border-border/70 bg-background/80">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {selectedChat ? selectedChat.leadName || selectedChat.phoneNumber : "Selecione uma conversa"}
                  </span>
                  {selectedChat && (
                    <span className="text-[11px] text-muted-foreground">{selectedChat.phoneNumber}</span>
                  )}
                </div>
                {selectedChat && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => refetchMessages()}
                    disabled={isLoadingMessages}
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingMessages ? "animate-spin" : ""}`} />
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 px-3 py-3">
                <div className="flex flex-col gap-2">
                  {evolutionInstances.length === 0 ? (
                    <p className="pt-10 text-center text-xs text-muted-foreground">
                      Configure uma instância para começar a usar o inbox.
                    </p>
                  ) : !selectedChat ? (
                    <p className="pt-10 text-center text-xs text-muted-foreground">
                      Selecione uma conversa à esquerda para ver as mensagens.
                    </p>
                  ) : isLoadingMessages ? (
                    <div className="flex items-center justify-center pt-10">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="pt-10 text-center text-xs text-muted-foreground">
                      Nenhuma mensagem encontrada neste chat.
                    </p>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        contactName={selectedChat?.leadName || selectedChat?.phoneNumber}
                        instance={selectedInstance}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>

              <SendMessageBox
                onSend={handleSendMessage}
                onSendMedia={async (file, type, caption) => {
                  if (!selectedChat?.phoneNumber) return false;
                  return sendMedia(selectedChat.phoneNumber, file, type, caption);
                }}
                disabled={!selectedChat || !selectedInstance}
                isSending={isSending}
              />
            </div>

            {/* Coluna 3: Resumo do Lead / Cadastro rápido inline */}
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-3 pr-2">
                {showQuickLeadForm ? (
                  /* ─── Cadastro rápido inline ─── */
                  <Card className="border-primary/30 bg-surface-elevated/80">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <UserPlus className="h-4 w-4" />
                          Cadastro rápido
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowQuickLeadForm(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid gap-2 grid-cols-2">
                        <div className="col-span-2">
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Nome *</label>
                          <Input className="h-8 text-xs" placeholder="Nome do lead" value={quickLead.nome} onChange={(e) => handleQuickLeadChange("nome", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Contato *</label>
                          <Input className="h-8 text-xs" placeholder="(11) 99999-9999" value={quickLead.contato} onChange={(e) => handleQuickLeadChange("contato", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Email</label>
                          <Input className="h-8 text-xs" type="email" placeholder="email@exemplo.com" value={quickLead.email} onChange={(e) => handleQuickLeadChange("email", e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Responsável</label>
                          <select className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-[11px]" value={quickLead.responsavel} onChange={(e) => handleQuickLeadChange("responsavel", e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Nara Helizabeth">Nara Helizabeth</option>
                            <option value="Adrielly Durans">Adrielly Durans</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Origem</label>
                          <select className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-[11px]" value={quickLead.origem} onChange={(e) => handleQuickLeadChange("origem", e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Anúncio">Anúncio</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Promoção">Promoção</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Data Nascimento</label>
                          <Input className="h-8 text-xs" type="date" value={quickLead.dataNascimento} onChange={(e) => handleQuickLeadChange("dataNascimento", e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">CPF</label>
                          <Input className="h-8 text-xs" placeholder="000.000.000-00" maxLength={14} value={quickLead.cpf} onChange={(e) => handleQuickLeadCpfChange(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">CEP</label>
                          <div className="relative">
                            <Input className="h-8 text-xs" placeholder="00000-000" maxLength={9} value={quickLead.cep} onChange={(e) => handleQuickLeadCepChange(e.target.value)} />
                            {quickLeadCepLoading && <Loader2 className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-muted-foreground" />}
                          </div>
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Número</label>
                          <Input className="h-8 text-xs" placeholder="Nº" value={quickLead.numero} onChange={(e) => handleQuickLeadChange("numero", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Endereço</label>
                          <Input className="h-8 text-xs" placeholder="Rua, Avenida..." value={quickLead.endereco} onChange={(e) => handleQuickLeadChange("endereco", e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Bairro</label>
                          <Input className="h-8 text-xs" placeholder="Bairro" value={quickLead.bairro} onChange={(e) => handleQuickLeadChange("bairro", e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Cidade</label>
                          <Input className="h-8 text-xs" placeholder="Cidade" value={quickLead.cidade} onChange={(e) => handleQuickLeadChange("cidade", e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Estado</label>
                          <Input className="h-8 text-xs" placeholder="UF" maxLength={2} value={quickLead.estado} onChange={(e) => handleQuickLeadChange("estado", e.target.value.toUpperCase())} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Complemento</label>
                          <Input className="h-8 text-xs" placeholder="Apto, Bloco..." value={quickLead.complemento} onChange={(e) => handleQuickLeadChange("complemento", e.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowQuickLeadForm(false)}>Cancelar</Button>
                        <Button size="sm" className="h-7 text-xs" onClick={handleSaveQuickLead} disabled={quickLeadSaving}>
                          {quickLeadSaving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                          Salvar lead
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* ─── Resumo do Lead (padrão) ─── */
                  <>
                    <Card className="border-border/80 bg-surface-elevated/80">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Resumo do lead</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs text-muted-foreground">
                        {selectedChat ? (
                          <>
                            <div>
                              <span className="font-medium text-foreground">Nome:</span>{" "}
                              {selectedChat.leadName || "Não identificado"}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Telefone:</span> {selectedChat.phoneNumber}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Origem:</span> {(selectedChat as any).origin || "-"}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Responsável:</span> {(selectedChat as any).assignedTo || "-"}
                            </div>
                          </>
                        ) : (
                          <p>Selecione um chat na coluna da esquerda para ver os dados do lead.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 bg-surface-elevated/80">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Ações rápidas</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2 text-xs">
                        {selectedChat && (() => {
                          const isInKanban = crmClients.some(
                            (c) => c.telefone === selectedChat.phoneNumber
                          );
                          return isInKanban ? (
                            <Badge variant="secondary" className="gap-1 text-xs py-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Já no Kanban
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={sendingToKanban}
                              onClick={async () => {
                                setSendingToKanban(true);
                                try {
                                  const { data: sessionData } = await supabase.auth.getSession();
                                  if (!sessionData.session) throw new Error("Não autenticado");
                                  const defaultStatus = getNovoLeadSlug();
                                  await supabase.from("crm_clients").insert({
                                    nome: selectedChat.leadName || selectedChat.phoneNumber,
                                    telefone: selectedChat.phoneNumber,
                                    status: defaultStatus,
                                    origem: "WhatsApp",
                                    user_id: sessionData.session.user.id,
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["crm-clients"] });
                                  toast({ title: "Enviado ao Kanban", description: "Contato adicionado com sucesso." });
                                } catch (err) {
                                  toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro desconhecido", variant: "destructive" });
                                } finally {
                                  setSendingToKanban(false);
                                }
                              }}
                            >
                              {sendingToKanban ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Kanban className="h-3 w-3 mr-1" />}
                              Enviar ao Kanban
                            </Button>
                          );
                        })()}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!selectedChat}
                          onClick={openQuickLeadForm}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Cadastro rápido
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!selectedChat}
                          onClick={openScheduleModal}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Agendar avaliação
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* INSTANCES TAB */}
        <TabsContent value="instances" className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Instâncias WhatsApp</h2>
              <p className="text-xs text-muted-foreground">
                Configure suas instâncias da Evolution API para conectar ao WhatsApp.
              </p>
            </div>
            <Button size="sm" onClick={() => handleOpenInstanceModal()}>
              <Plus className="mr-1 h-4 w-4" />
              Nova instância
            </Button>
          </div>

          {isLoadingInstances ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : evolutionInstances.length === 0 ? (
            <Card className="border-dashed border-border/80 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium mb-1">Nenhuma instância configurada</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                  Configure sua primeira instância da Evolution API para começar a usar o WhatsApp integrado.
                </p>
                <Button size="sm" onClick={() => handleOpenInstanceModal()}>
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar instância
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {evolutionInstances.map((instance) => (
                <InstanceCard
                  key={instance.id}
                  instance={instance}
                  onEdit={handleOpenInstanceModal}
                  onDelete={handleDeleteInstance}
                  onGenerateQr={handleOpenQr}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Templates de mensagens</h2>
              <p className="text-xs text-muted-foreground">
                Biblioteca de mensagens prontas para boas-vindas, confirmações e follow-ups.
              </p>
            </div>
            <Button size="sm" onClick={() => handleOpenTemplateModal()}>
              <Plus className="mr-1 h-4 w-4" />
              Novo template
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-surface-elevated/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input placeholder="Buscar por nome ou conteúdo" className="h-8 max-w-xs text-xs" />
              <Badge variant="outline" className="rounded-full text-[11px] uppercase tracking-wide">
                {templates.length} templates
              </Badge>
            </div>

            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">Nenhum template criado ainda.</p>
                <Button size="sm" variant="outline" onClick={() => handleOpenTemplateModal()}>
                  <Plus className="mr-1 h-4 w-4" />
                  Criar primeiro template
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[360px]">
                <div className="flex flex-col gap-3">
                  {templates.map((tpl) => (
                    <Card key={tpl.id} className="border-border/70 bg-background/90">
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-col gap-1">
                            <CardTitle className="text-sm font-semibold">{tpl.name}</CardTitle>
                            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                              <Badge variant="outline" className="rounded-full px-2 text-[10px] uppercase">
                                {tpl.type === "manual" ? "Manual" : "Automático"}
                              </Badge>
                              {tpl.type === "automatic" && (
                                <span>
                                  Trigger: <span className="font-medium">{tpl.trigger}</span> ({tpl.triggerValue})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {tpl.active ? (
                              <Badge className="rounded-full bg-emerald-500/90 text-[10px] text-emerald-50">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-full text-[10px]">
                                Inativo
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenTemplateModal(tpl)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => deleteTemplate(tpl.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 pt-1">
                        <pre className="whitespace-pre-wrap text-[11px] leading-snug text-muted-foreground">
                          {tpl.content}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Configurações do módulo</h2>
              <p className="text-xs text-muted-foreground">
                Parâmetros gerais de atendimento, SLA e horários usados pelas automações.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/80 bg-surface-elevated/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Regras de SLA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Tempo alvo de primeira resposta (minutos)
                  </label>
                  <Input defaultValue="5" className="h-8 max-w-[120px] text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Tempo para follow-up automático (horas)
                  </label>
                  <Input defaultValue="24" className="h-8 max-w-[120px] text-xs" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-surface-elevated/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Horários de atendimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Dias úteis</label>
                  <Input defaultValue="Seg a Sex - 08h às 20h" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Sábados</label>
                  <Input defaultValue="09h às 14h" className="h-8 text-xs" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <QRCodeModal open={qrOpen} onOpenChange={setQrOpen} instance={qrInstance} />
      
      <InstanceFormModal
        open={instanceModalOpen}
        onOpenChange={setInstanceModalOpen}
        instance={editingInstance}
        onSubmit={handleInstanceSubmit}
        isSubmitting={isSubmitting}
      />

      <TemplateFormModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        template={editingTemplate}
        onSubmit={handleTemplateSubmit}
        isSubmitting={isTemplateSubmitting}
      />

      {/* Quick Lead Registration Dialog */}
      <Dialog open={showQuickLeadForm} onOpenChange={setShowQuickLeadForm}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cadastro rápido de Lead
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Responsável</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs" value={quickLead.responsavel} onChange={(e) => handleQuickLeadChange("responsavel", e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Nara Helizabeth">Nara Helizabeth</option>
                <option value="Adrielly Durans">Adrielly Durans</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome do cliente *</label>
              <Input placeholder="Nome do lead" value={quickLead.nome} onChange={(e) => handleQuickLeadChange("nome", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Contato *</label>
              <Input placeholder="(11) 99999-9999" value={quickLead.contato} onChange={(e) => handleQuickLeadChange("contato", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
              <Input type="email" placeholder="email@exemplo.com" value={quickLead.email} onChange={(e) => handleQuickLeadChange("email", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Origem</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs" value={quickLead.origem} onChange={(e) => handleQuickLeadChange("origem", e.target.value)}>
                <option value="">Selecione...</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Anúncio">Anúncio</option>
                <option value="Indicação">Indicação</option>
                <option value="Promoção">Promoção</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Data Nascimento</label>
              <Input type="date" value={quickLead.dataNascimento} onChange={(e) => handleQuickLeadChange("dataNascimento", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">CPF</label>
              <Input placeholder="000.000.000-00" maxLength={14} value={quickLead.cpf} onChange={(e) => handleQuickLeadCpfChange(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">CEP</label>
              <div className="relative">
                <Input placeholder="00000-000" maxLength={9} value={quickLead.cep} onChange={(e) => handleQuickLeadCepChange(e.target.value)} />
                {quickLeadCepLoading && <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Endereço</label>
              <Input placeholder="Rua, Avenida..." value={quickLead.endereco} onChange={(e) => handleQuickLeadChange("endereco", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Número</label>
              <Input placeholder="Nº" value={quickLead.numero} onChange={(e) => handleQuickLeadChange("numero", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Bairro</label>
              <Input placeholder="Bairro" value={quickLead.bairro} onChange={(e) => handleQuickLeadChange("bairro", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Cidade</label>
              <Input placeholder="Cidade" value={quickLead.cidade} onChange={(e) => handleQuickLeadChange("cidade", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Estado</label>
              <Input placeholder="UF" maxLength={2} value={quickLead.estado} onChange={(e) => handleQuickLeadChange("estado", e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Complemento</label>
              <Input placeholder="Apto, Bloco..." value={quickLead.complemento} onChange={(e) => handleQuickLeadChange("complemento", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setShowQuickLeadForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSaveQuickLead} disabled={quickLeadSaving}>
              {quickLeadSaving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Salvar lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Evaluation Dialog */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendar avaliação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Cliente</label>
              <Input value={selectedChat?.leadName || selectedChat?.phoneNumber || ""} disabled className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Data *</label>
                <Input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Horário *</label>
                <Input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Profissional</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs" value={scheduleForm.professionalId} onChange={(e) => setScheduleForm(p => ({ ...p, professionalId: e.target.value }))}>
                <option value="">Selecione...</option>
                {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Serviço</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs" value={scheduleForm.serviceId} onChange={(e) => setScheduleForm(p => ({ ...p, serviceId: e.target.value }))}>
                <option value="">Selecione...</option>
                {(services || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Duração</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-xs" value={scheduleForm.duration} onChange={(e) => setScheduleForm(p => ({ ...p, duration: e.target.value }))}>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1h30</option>
                <option value="120">2 horas</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Observações</label>
              <Textarea className="text-xs" rows={2} value={scheduleForm.notes} onChange={(e) => setScheduleForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setShowScheduleModal(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSaveSchedule} disabled={scheduleSaving}>
              {scheduleSaving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Agendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsappV2Page;
