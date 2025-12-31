import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, User, MessageSquare, Clock, FileText, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mensagem, EventoHistorico } from '@/types/crm';
import { AbaChatConversa } from '@/components/crm/AbaChatConversa';
import { AbaHistorico } from '@/components/crm/AbaHistorico';
import { AbaDados } from '@/components/crm/AbaDados';
import { useToast } from '@/hooks/use-toast';
import { useCRMClients } from '../hooks/useCRMClients';
import { useCRMStatuses } from '../hooks/useCRMStatuses';
import { Skeleton } from '@/components/ui/skeleton';

const ClientePotencialV2Page = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { clients, isLoading, updateClient, updateStatus } = useCRMClients();
  const { statuses } = useCRMStatuses();

  // Buscar cliente pelo ID
  const clienteData = clients.find(c => c.id === id);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    responsavel: '',
    observacoes: '',
  });
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [historico, setHistorico] = useState<EventoHistorico[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');

  useEffect(() => {
    if (clienteData) {
      setFormData({
        nome: clienteData.nome,
        telefone: clienteData.telefone,
        email: clienteData.email || '',
        responsavel: clienteData.responsavel || '',
        observacoes: clienteData.observacoes || '',
      });
    }
  }, [clienteData]);

  if (isLoading) {
    return (
      <div className="flex-1 px-4 pt-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!clienteData) {
    return (
      <div className="flex-1 px-4 pt-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/kanbam/painel">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o painel
          </Link>
        </Button>
        <div className="p-8 text-sm text-muted-foreground border rounded-lg">
          Cliente não encontrado. Ele pode ter sido removido do sistema.
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateClient.mutate({
      id: clienteData.id,
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email || null,
      responsavel: formData.responsavel || null,
      observacoes: formData.observacoes || null,
    }, {
      onSuccess: () => {
        setEditMode(false);
        toast({ title: "Dados atualizados com sucesso!" });
      }
    });
  };

  const handleCancel = () => {
    setFormData({
      nome: clienteData.nome,
      telefone: clienteData.telefone,
      email: clienteData.email || '',
      responsavel: clienteData.responsavel || '',
      observacoes: clienteData.observacoes || '',
    });
    setEditMode(false);
  };

  const handleStatusChange = (novoStatus: string) => {
    updateStatus.mutate({ id: clienteData.id, status: novoStatus }, {
      onSuccess: () => {
        toast({ title: "Status atualizado" });
      }
    });
  };

  const adicionarTag = (novaTag: string) => {
    const newTags = [...(clienteData.tags || []), novaTag];
    updateClient.mutate({ id: clienteData.id, tags: newTags });
  };

  const atualizarObservacoes = (texto: string) => {
    updateClient.mutate({ id: clienteData.id, observacoes: texto });
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;
    
    const msg: Mensagem = {
      id: `m-${Date.now()}`,
      clienteId: clienteData.id,
      remetente: 'atendente',
      nomeRemetente: 'Você',
      texto: novaMensagem,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      data: new Date().toISOString(),
      lida: true
    };
    
    setMensagens(prev => [...prev, msg]);
    setNovaMensagem('');
    
    const evento: EventoHistorico = {
      id: `h-${Date.now()}`,
      clienteId: clienteData.id,
      tipo: 'mensagem_enviada',
      descricao: 'Mensagem enviada ao cliente',
      usuario: 'Você',
      dataHora: new Date().toISOString()
    };
    setHistorico(prev => [evento, ...prev]);
  };

  // Preparar dados para AbaDados
  const clienteParaAbaDados = {
    id: clienteData.id,
    nome: clienteData.nome,
    telefone: clienteData.telefone,
    email: clienteData.email || undefined,
    status: clienteData.status as any,
    responsavel: clienteData.responsavel || undefined,
    origem: clienteData.origem || undefined,
    ultimaMensagem: clienteData.ultima_mensagem || undefined,
    horarioUltimaMensagem: clienteData.horario_ultima_mensagem || undefined,
    dataCriacao: clienteData.data_criacao || '',
    ultimaInteracao: clienteData.ultima_interacao || '',
    tags: clienteData.tags || [],
    observacoes: clienteData.observacoes || undefined,
    totalMensagens: clienteData.total_mensagens,
    mensagensNaoLidas: clienteData.mensagens_nao_lidas,
    urgente: clienteData.urgente,
  };

  return (
    <div className="flex-1 px-4 pt-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/kanbam/painel">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o painel
        </Link>
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          {editMode ? (
            /* Modo de edição */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Editar Cliente</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="mr-1 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateClient.isPending}>
                    <Save className="mr-1 h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            /* Modo de visualização */
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {clienteData.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{clienteData.nome}</h1>
                  <Button size="sm" variant="ghost" onClick={() => setEditMode(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {clienteData.telefone}
                  </span>
                  {clienteData.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {clienteData.email}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Select value={clienteData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.length > 0 ? (
                      statuses.map(status => (
                        <SelectItem key={status.id} value={status.slug}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.color}`} />
                            {status.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="novo">🆕 Novo</SelectItem>
                        <SelectItem value="qualificacao">🔍 Em qualificação</SelectItem>
                        <SelectItem value="aguardando">⏳ Aguardando</SelectItem>
                        <SelectItem value="em_atendimento">💬 Em atendimento</SelectItem>
                        <SelectItem value="fechou">✅ Fechou</SelectItem>
                        <SelectItem value="perdido">❌ Perdido</SelectItem>
                        <SelectItem value="voltar">📞 Voltar contato</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                {clienteData.responsavel && (
                  <Badge variant="outline" className="justify-center">
                    <User className="mr-1 h-3 w-3" />
                    {clienteData.responsavel}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="conversa">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversa">
            <MessageSquare className="mr-2 h-4 w-4" />
            Conversa
          </TabsTrigger>
          <TabsTrigger value="historico">
            <Clock className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="dados">
            <FileText className="mr-2 h-4 w-4" />
            Dados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversa">
          <AbaChatConversa
            mensagens={mensagens}
            novaMensagem={novaMensagem}
            setNovaMensagem={setNovaMensagem}
            onEnviar={enviarMensagem}
          />
        </TabsContent>
        
        <TabsContent value="historico">
          <AbaHistorico historico={historico} />
        </TabsContent>
        
        <TabsContent value="dados">
          <AbaDados
            cliente={clienteParaAbaDados}
            onAdicionarTag={adicionarTag}
            onAtualizarObservacoes={atualizarObservacoes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientePotencialV2Page;
