import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableCard } from "@/components/dashboard/TableCard";
import { useClients, Client } from "./hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";
import { SensitiveData } from "@/components/ui/SensitiveData";
import { maskCPF, maskPhone, maskAddress, extractCity } from "@/lib/sensitiveDataUtils";
import { useCRMHistory } from "@/modules/kanbam-v2/hooks/useCRMHistory";
import { useProntuario } from "./hooks/useProntuario";
import { AbaHistorico } from "@/components/crm/AbaHistorico";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, Stethoscope, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ClientesV2Page = () => {
  const { clients, isLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();

  // Hooks for selected client's history and prontuário
  const { history, isLoading: historyLoading } = useCRMHistory(undefined, selectedClient?.id);
  const { records: prontuarioRecords, isLoading: prontuarioLoading, addRecord, deleteRecord } = useProntuario(selectedClient?.id);

  // Prontuário form state
  const [showProntuarioForm, setShowProntuarioForm] = useState(false);
  const [prontuarioForm, setProntuarioForm] = useState({
    tipo: 'evolucao',
    titulo: '',
    conteudo: '',
    profissional: '',
  });

  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Clientes &amp; Clínico</h1>
        <p className="text-sm text-muted-foreground">
          Visão unificada de cadastro, histórico e prontuário eletrônico dos pacientes.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
        <TableCard title="Pacientes">
          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : clients.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
            ) : (
              clients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClient(client)}
                    className={`flex w-full items-center justify-between border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 ${
                      isSelected ? "bg-primary/5" : "hover:bg-surface-elevated/70"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {extractCity(client.address)} • {client.phone || "-"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Cadastro</p>
                      <p className="font-medium text-foreground">
                        {client.created_at 
                          ? new Date(client.created_at).toLocaleDateString('pt-BR')
                          : "-"
                        }
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </TableCard>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Visão 360º do paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient ? (
              <>
                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="text-sm font-medium">{selectedClient.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Idade</p>
                    <p className="text-sm font-medium">
                      {calculateAge(selectedClient.birth_date) 
                        ? `${calculateAge(selectedClient.birth_date)} anos`
                        : "-"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cidade</p>
                    <p className="text-sm font-medium">{extractCity(selectedClient.address)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <SensitiveData 
                      maskedValue={maskPhone(selectedClient.phone)} 
                      fullValue={selectedClient.phone || "-"}
                      label="telefone"
                      size="sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedClient.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CPF</p>
                    <SensitiveData 
                      maskedValue={maskCPF(selectedClient.cpf)} 
                      fullValue={selectedClient.cpf || "-"}
                      label="CPF"
                      size="sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data Nascimento</p>
                    <p className="text-sm font-medium">
                      {selectedClient.birth_date 
                        ? new Date(selectedClient.birth_date).toLocaleDateString('pt-BR')
                        : "-"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Origem</p>
                    <p className="text-sm font-medium">{selectedClient.origem || "-"}</p>
                  </div>
                </div>

                <Tabs defaultValue="summary" className="mt-2">
                  <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="summary">Resumo</TabsTrigger>
                    <TabsTrigger value="history">
                      <ClipboardList className="mr-1 h-3.5 w-3.5" />
                      Histórico
                    </TabsTrigger>
                    <TabsTrigger value="chart">
                      <Stethoscope className="mr-1 h-3.5 w-3.5" />
                      Prontuário
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-3 text-sm text-muted-foreground">
                    <div className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Procedimento</p>
                          <p className="text-sm font-medium text-foreground">{selectedClient.procedimento || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Fechado</p>
                          <p className="text-sm font-medium text-primary">
                            {selectedClient.valor_fechado 
                              ? `R$ ${selectedClient.valor_fechado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data Fechamento</p>
                          <p className="text-sm font-medium text-foreground">
                            {selectedClient.data_fechamento 
                              ? new Date(selectedClient.data_fechamento).toLocaleDateString('pt-BR')
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Responsável</p>
                          <p className="text-sm font-medium text-foreground">{selectedClient.responsavel || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data Entrada</p>
                          <p className="text-sm font-medium text-foreground">
                            {selectedClient.data_entrada 
                              ? new Date(selectedClient.data_entrada).toLocaleDateString('pt-BR')
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Último Contato</p>
                          <p className="text-sm font-medium text-foreground">
                            {selectedClient.data_ultimo_contato 
                              ? new Date(selectedClient.data_ultimo_contato).toLocaleDateString('pt-BR')
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data Agendamento</p>
                          <p className="text-sm font-medium text-foreground">
                            {selectedClient.data_agendamento 
                              ? new Date(selectedClient.data_agendamento).toLocaleDateString('pt-BR')
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data Avaliação</p>
                          <p className="text-sm font-medium text-foreground">
                            {selectedClient.data_avaliacao 
                              ? new Date(selectedClient.data_avaliacao).toLocaleDateString('pt-BR')
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data Procedimento</p>
                          <p className="text-sm font-medium text-foreground">
                            {selectedClient.data_procedimento 
                              ? new Date(selectedClient.data_procedimento).toLocaleDateString('pt-BR')
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Compareceu</p>
                          <p className="text-sm font-medium text-foreground">{selectedClient.compareceu || "-"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Endereço Completo</p>
                        <SensitiveData 
                          maskedValue={maskAddress(selectedClient.address)} 
                          fullValue={selectedClient.address || "Não informado"}
                          label="endereço"
                          size="sm"
                        />
                      </div>
                      
                      {selectedClient.tags && selectedClient.tags.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tags</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedClient.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedClient.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground">Observações</p>
                          <p className="text-sm whitespace-pre-wrap">{selectedClient.notes}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-3">
                    {historyLoading ? (
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>Nenhum evento no histórico deste paciente.</p>
                        <p className="text-xs mt-1">Eventos são registrados automaticamente pelo Quadro de Atendimento.</p>
                      </div>
                    ) : (
                      <AbaHistorico historico={history.map(h => ({
                        id: h.id,
                        clienteId: h.crm_client_id || '',
                        tipo: h.tipo as any,
                        descricao: h.descricao,
                        usuario: h.usuario,
                        dataHora: h.created_at,
                        detalhes: h.detalhes as any,
                      }))} />
                    )}
                  </TabsContent>

                  <TabsContent value="chart" className="mt-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Prontuário Eletrônico</h3>
                      <Button size="sm" onClick={() => setShowProntuarioForm(!showProntuarioForm)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Novo Registro
                      </Button>
                    </div>

                    {showProntuarioForm && (
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo</Label>
                              <Select value={prontuarioForm.tipo} onValueChange={(v) => setProntuarioForm(prev => ({ ...prev, tipo: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="evolucao">Evolução</SelectItem>
                                  <SelectItem value="queixa">Queixa / Objetivo</SelectItem>
                                  <SelectItem value="procedimento">Procedimento Realizado</SelectItem>
                                  <SelectItem value="observacao">Observação Clínica</SelectItem>
                                  <SelectItem value="retorno">Retorno</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Profissional</Label>
                              <Input
                                placeholder="Nome do profissional"
                                value={prontuarioForm.profissional}
                                onChange={(e) => setProntuarioForm(prev => ({ ...prev, profissional: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Título</Label>
                            <Input
                              placeholder="Ex: Avaliação inicial, Aplicação de toxina..."
                              value={prontuarioForm.titulo}
                              onChange={(e) => setProntuarioForm(prev => ({ ...prev, titulo: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Conteúdo / Descrição</Label>
                            <Textarea
                              placeholder="Descreva o atendimento, observações clínicas, evolução..."
                              value={prontuarioForm.conteudo}
                              onChange={(e) => setProntuarioForm(prev => ({ ...prev, conteudo: e.target.value }))}
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setShowProntuarioForm(false)}>Cancelar</Button>
                            <Button size="sm" disabled={!prontuarioForm.titulo || addRecord.isPending} onClick={() => {
                              addRecord.mutate({
                                lead_id: selectedClient.id,
                                tipo: prontuarioForm.tipo,
                                titulo: prontuarioForm.titulo,
                                conteudo: prontuarioForm.conteudo || undefined,
                                profissional: prontuarioForm.profissional || undefined,
                              }, {
                                onSuccess: () => {
                                  toast({ title: "Registro adicionado ao prontuário" });
                                  setProntuarioForm({ tipo: 'evolucao', titulo: '', conteudo: '', profissional: '' });
                                  setShowProntuarioForm(false);
                                }
                              });
                            }}>
                              Salvar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {prontuarioLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : prontuarioRecords.length === 0 && !showProntuarioForm ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>Nenhum registro no prontuário.</p>
                        <p className="text-xs mt-1">Clique em "Novo Registro" para adicionar evolução clínica, queixas ou procedimentos.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {prontuarioRecords.map((record) => {
                          const tipoLabels: Record<string, string> = {
                            evolucao: 'Evolução',
                            queixa: 'Queixa / Objetivo',
                            procedimento: 'Procedimento',
                            observacao: 'Observação',
                            retorno: 'Retorno',
                          };
                          const tipoColors: Record<string, string> = {
                            evolucao: 'bg-blue-500/10 text-blue-600',
                            queixa: 'bg-orange-500/10 text-orange-600',
                            procedimento: 'bg-emerald-500/10 text-emerald-600',
                            observacao: 'bg-gray-500/10 text-gray-600',
                            retorno: 'bg-purple-500/10 text-purple-600',
                          };
                          return (
                            <Card key={record.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${tipoColors[record.tipo] || 'bg-muted text-muted-foreground'}`}>
                                        {tipoLabels[record.tipo] || record.tipo}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(record.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                      </span>
                                    </div>
                                    <p className="font-medium text-sm">{record.titulo}</p>
                                    {record.conteudo && (
                                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{record.conteudo}</p>
                                    )}
                                    {record.profissional && (
                                      <p className="text-xs text-muted-foreground mt-1">Profissional: {record.profissional}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      deleteRecord.mutate(record.id, {
                                        onSuccess: () => toast({ title: "Registro removido" }),
                                      });
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Selecione um paciente na coluna ao lado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientesV2Page;
