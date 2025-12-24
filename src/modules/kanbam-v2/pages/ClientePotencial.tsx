import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, User, MessageSquare, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusLead, Mensagem, EventoHistorico } from '@/types/crm';
import { AbaChatConversa } from '@/components/crm/AbaChatConversa';
import { AbaHistorico } from '@/components/crm/AbaHistorico';
import { AbaDados } from '@/components/crm/AbaDados';
import { useToast } from '@/hooks/use-toast';

const ClientePotencialV2Page = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const clienteInicial = null;

  if (!clienteInicial) {
    return <div className="p-8 text-sm text-muted-foreground">Nenhum dado de cliente disponível no momento. Conecte o Kanban a uma fonte real de dados para visualizar detalhes.</div>;
  }
 
  const [cliente, setCliente] = useState(clienteInicial);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [historico, setHistorico] = useState<EventoHistorico[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');

  const atualizarStatus = (novoStatus: StatusLead) => {
    setCliente(prev => ({ ...prev, status: novoStatus }));
    toast({ title: "Status atualizado", description: `Status alterado para ${novoStatus}` });
  };

  const adicionarTag = (novaTag: string) => {
    setCliente(prev => ({ ...prev, tags: [...prev.tags, novaTag] }));
  };

  const atualizarObservacoes = (texto: string) => {
    setCliente(prev => ({ ...prev, observacoes: texto }));
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;
    
    const msg: Mensagem = {
      id: `m-${Date.now()}`,
      clienteId: cliente.id,
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
      clienteId: cliente.id,
      tipo: 'mensagem_enviada',
      descricao: 'Mensagem enviada ao cliente',
      usuario: 'Você',
      dataHora: new Date().toISOString()
    };
    setHistorico(prev => [evento, ...prev]);
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
        <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {cliente.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{cliente.nome}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {cliente.telefone}
              </span>
              {cliente.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {cliente.email}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Select value={cliente.status} onValueChange={atualizarStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">🆕 Novo</SelectItem>
                <SelectItem value="qualificacao">🔍 Em qualificação</SelectItem>
                <SelectItem value="aguardando">⏳ Aguardando</SelectItem>
                <SelectItem value="atendimento">💬 Em atendimento</SelectItem>
                <SelectItem value="finalizado">✅ Finalizado</SelectItem>
                <SelectItem value="perdido">❌ Perdido</SelectItem>
                <SelectItem value="voltar">📞 Voltar contato</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="justify-center">
              <User className="mr-1 h-3 w-3" />
              {cliente.responsavel}
            </Badge>
          </div>
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
            cliente={cliente}
            onAdicionarTag={adicionarTag}
            onAtualizarObservacoes={atualizarObservacoes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientePotencialV2Page;
