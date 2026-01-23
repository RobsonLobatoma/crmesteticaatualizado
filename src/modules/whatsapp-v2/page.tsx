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
import { useEvolutionInstances } from "./hooks/useEvolutionInstances";
import { MOCK_WHATSAPP_TEMPLATES } from "./mock";
import { WhatsappChat, WhatsappMessage, WhatsappTemplate, EvolutionInstanceConfig } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

const WhatsappV2Page = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [chats, setChats] = useState<WhatsappChat[]>([]);
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const [templates] = useState<WhatsappTemplate[]>([]);
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

  const filteredChats = useMemo(
    () => chats.filter((chat) => !selectedInstanceId || chat.instanceId === selectedInstanceId),
    [chats, selectedInstanceId],
  );

  const selectedChatMessages = useMemo(
    () => (selectedChatId ? messages.filter((m) => m.chatId === selectedChatId) : []),
    [messages, selectedChatId],
  );

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) return;
    const newMessage: WhatsappMessage = {
      id: `local-${Date.now()}`,
      chatId: selectedChatId,
      direction: "outbound",
      type: "text",
      content,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              lastMessagePreview: content,
              lastMessageAt: newMessage.sentAt,
              unreadCount: chat.unreadCount,
            }
          : chat,
      ),
    );
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

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">WhatsApp &amp; Comunicação</h1>
            <p className="text-sm text-muted-foreground">
              Módulo V2 com inbox unificada, múltiplas instâncias e templates prontos para automações da clínica.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full text-[11px] uppercase tracking-wide">
              Simulação front-end
            </Badge>
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

        <TabsContent value="inbox" className="flex flex-1 flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Instância</label>
              <select
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                value={selectedInstanceId}
                onChange={(e) => setSelectedInstanceId(e.target.value || undefined)}
              >
                <option value="">Todas as instâncias</option>
                {evolutionInstances.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>

              <ChatList
                chats={filteredChats}
                selectedChatId={selectedChatId}
                onSelect={setSelectedChatId}
              />
            </div>

            <div className="flex min-h-[360px] flex-col rounded-xl border border-border/70 bg-background/80">
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
                  <Badge variant="outline" className="rounded-full text-[11px]">
                    Origem: {selectedChat.origin || "-"}
                  </Badge>
                )}
              </div>

              <ScrollArea className="flex-1 px-3 py-3">
                <div className="flex flex-col gap-2">
                  {selectedChatMessages.length === 0 && (
                    <p className="pt-10 text-center text-xs text-muted-foreground">
                      Nenhuma mensagem neste chat ainda. Envie uma primeira mensagem abaixo.
                    </p>
                  )}
                  {selectedChatMessages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </ScrollArea>

              <SendMessageBox onSend={handleSendMessage} />
            </div>

            <div className="flex flex-col gap-3">
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
                    onClick={() =>
                      toast({
                        title: "Agendar avaliação (mock)",
                        description: "No futuro este botão abrirá a agenda integrada.",
                      })
                    }
                  >
                    Agendar avaliação
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: "Abrir no Leads V2 (mock)",
                        description: "Aqui faremos o deep link para o módulo de Leads.",
                      })
                    }
                  >
                    Abrir no Leads V2
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: "Marcar como convertido (mock)",
                        description: "Simulação apenas no front; não altera nenhum dado real.",
                      })
                    }
                  >
                    Marcar como convertido
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

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

        <TabsContent value="templates" className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Templates de mensagens</h2>
              <p className="text-xs text-muted-foreground">
                Biblioteca de mensagens prontas para boas-vindas, confirmações e follow-ups comerciais.
              </p>
            </div>
            <Button size="sm">Novo template (mock)</Button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-surface-elevated/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input placeholder="Buscar por nome, trigger ou conteúdo" className="h-8 max-w-xs text-xs" />
              <Badge variant="outline" className="rounded-full text-[11px] uppercase tracking-wide">
                {templates.length} templates
              </Badge>
            </div>

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
                            <span>
                              Trigger: <span className="font-medium">{tpl.trigger}</span> ({tpl.triggerValue})
                            </span>
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
                            onClick={() =>
                              toast({
                                title: "Editar template (mock)",
                                description: `Template: ${tpl.name}. Aqui teremos o editor real no futuro.`,
                              })
                            }
                          >
                            Editar
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
          </div>
        </TabsContent>

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
    </div>
  );
};

export default WhatsappV2Page;

