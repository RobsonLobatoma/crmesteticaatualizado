import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
import { WhatsappTemplate, EvolutionInstanceConfig } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, RefreshCw, Trash2 } from "lucide-react";

const WhatsappV2Page = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>(undefined);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [qrInstance, setQrInstance] = useState<EvolutionInstanceConfig | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  
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
  const { sendMessage, isSending } = useSendMessage({
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

  const handleSendMessage = async (content: string) => {
    if (!selectedChat?.phoneNumber) return false;
    
    // Add optimistic message
    addOptimisticMessage(content);
    
    // Send via API
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
          {evolutionInstances.length === 0 ? (
            <Card className="border-dashed border-border/80 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-sm font-medium mb-1">Configure uma instância primeiro</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Para usar o inbox, você precisa configurar uma instância da Evolution API.
                </p>
                <Button size="sm" onClick={() => setActiveTab("instances")}>
                  Ir para Instâncias
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1.4fr)_minmax(0,1fr)] h-[calc(100vh-220px)] min-h-[500px]">
              <div className="flex flex-col gap-2 h-full min-h-0">
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

                {isLoadingChats ? (
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
              </div>

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
                    {!selectedChat ? (
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
                        <MessageBubble key={message.id} message={message} />
                      ))
                    )}
                  </div>
                </ScrollArea>

                <SendMessageBox
                  onSend={handleSendMessage}
                  disabled={!selectedChat || !selectedInstance}
                  isSending={isSending}
                />
              </div>

              <ScrollArea className="h-full">
              <div className="flex flex-col gap-3 pr-2">
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
                          <span className="font-medium text-foreground">Origem:</span> {selectedChat.origin || "-"}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Responsável:</span> {selectedChat.assignedTo || "-"}
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
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!selectedChat}
                      onClick={() =>
                        toast({
                          title: "Agendar avaliação",
                          description: "No futuro este botão abrirá a agenda integrada.",
                        })
                      }
                    >
                      Agendar avaliação
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!selectedChat}
                      onClick={() =>
                        toast({
                          title: "Abrir no Leads V2",
                          description: "Aqui faremos o deep link para o módulo de Leads.",
                        })
                      }
                    >
                      Abrir no Leads V2
                    </Button>
                  </CardContent>
                </Card>
            </div>
              </ScrollArea>
            </div>
          )}
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
    </div>
  );
};

export default WhatsappV2Page;
