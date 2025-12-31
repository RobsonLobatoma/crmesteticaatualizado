import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientePotencial, FiltrosKanban as FiltrosKanbanType } from '@/types/crm';
import { ColunaKanban } from '@/components/crm/ColunaKanban';
import { FiltrosKanban } from '@/components/crm/FiltrosKanban';
import { CartaoCliente } from '@/components/crm/CartaoCliente';
import { useToast } from '@/hooks/use-toast';
import { useCRMStatuses } from '../hooks/useCRMStatuses';
import { useCRMClients } from '../hooks/useCRMClients';
import { cn } from '@/lib/utils';

// Colunas padrão para quando não há status cadastrados
const colunasDefault = [
  { id: 'novo', titulo: 'Novo', cor: 'bg-blue-500' },
  { id: 'qualificacao', titulo: 'Em qualificação', cor: 'bg-yellow-500' },
  { id: 'aguardando', titulo: 'Aguardando atendente', cor: 'bg-orange-500' },
  { id: 'em_atendimento', titulo: 'Em atendimento', cor: 'bg-green-500' },
  { id: 'fechou', titulo: 'Fechou', cor: 'bg-emerald-600' },
  { id: 'perdido', titulo: 'Perdido', cor: 'bg-red-500' },
  { id: 'voltar', titulo: 'Voltar contato', cor: 'bg-purple-500' },
];

// Mapear status legados para novos slugs
const statusLegacyMap: Record<string, string> = {
  'finalizado': 'fechou',
  'atendimento': 'em_atendimento',
};

const PainelV2Page = () => {
  const { toast } = useToast();
  const { statuses, isLoading: loadingStatuses } = useCRMStatuses();
  const { clients, isLoading: loadingClients, updateStatus } = useCRMClients();
  const [filtros, setFiltros] = useState<FiltrosKanbanType>({
    busca: '',
    responsavel: 'todos',
    origem: 'todos',
    apenasUrgentes: false,
    apenasNaoLidos: false,
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Usa status do banco ou colunas padrão
  const colunas = statuses.length > 0
    ? statuses.map(s => ({ id: s.slug, titulo: s.name, cor: s.color }))
    : colunasDefault;

  // Mapear clientes do banco para o formato esperado pelo componente
  // Aplica mapeamento de status legados para novos slugs
  const clientes: ClientePotencial[] = useMemo(() => {
    return clients.map(c => {
      // Mapeia status legado para novo slug se necessário
      const mappedStatus = statusLegacyMap[c.status] || c.status;
      
      return {
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        email: c.email || undefined,
        status: mappedStatus as ClientePotencial['status'],
        responsavel: c.responsavel || undefined,
        origem: c.origem || undefined,
        ultimaMensagem: c.ultima_mensagem || undefined,
        horarioUltimaMensagem: c.horario_ultima_mensagem || undefined,
        dataCriacao: c.data_criacao,
        ultimaInteracao: c.ultima_interacao,
        tags: c.tags || [],
        observacoes: c.observacoes || undefined,
        totalMensagens: c.total_mensagens,
        mensagensNaoLidas: c.mensagens_nao_lidas,
        urgente: c.urgente,
      };
    });
  }, [clients]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const clienteId = active.id as string;
    const novoStatus = over.id as string;
    
    const cliente = clientes.find(c => c.id === clienteId);
    const statusAnterior = cliente?.status;
    
    if (statusAnterior && statusAnterior !== novoStatus && cliente) {
      const colunaDestino = colunas.find(col => col.id === novoStatus);
      
      // Atualizar no banco de dados
      updateStatus.mutate({ id: clienteId, status: novoStatus });

      if (colunaDestino) {
        toast({
          title: "Status atualizado",
          description: `${cliente.nome} movido para "${colunaDestino.titulo}"`,
        });
      }
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      if (!cliente.nome.toLowerCase().includes(busca) && 
          !cliente.telefone.includes(busca)) {
        return false;
      }
    }
    if (filtros.responsavel !== 'todos' && cliente.responsavel !== filtros.responsavel) {
      return false;
    }
    if (filtros.origem !== 'todos' && cliente.origem !== filtros.origem) {
      return false;
    }
    if (filtros.apenasUrgentes && !cliente.urgente) {
      return false;
    }
    if (filtros.apenasNaoLidos && cliente.mensagensNaoLidas === 0) {
      return false;
    }
    return true;
  });

  const activeCliente = activeId ? clientes.find(c => c.id === activeId) : null;

  if (loadingStatuses || loadingClients) {
    return (
      <div className="flex-1 px-4 pt-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Quadro de Atendimento</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 pt-6 lg:px-8 flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quadro de Atendimento</h1>
        <p className="text-muted-foreground">Gerencie seus leads através do funil de vendas</p>
      </div>

      <FiltrosKanban filtros={filtros} onChange={setFiltros} />

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar com métricas - visível apenas em desktop */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 space-y-4">
          <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumo do Quadro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {colunas.map(coluna => {
                const count = clientesFiltrados.filter(c => c.status === coluna.id).length;
                return (
                  <div key={coluna.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", coluna.cor)} />
                      <span className="text-sm truncate max-w-[140px]">{coluna.titulo}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{count}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{clientesFiltrados.length}</p>
                <p className="text-sm text-muted-foreground">clientes ativos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área principal do Kanban */}
        <div className="flex-1 flex flex-col min-w-0">
          <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <ScrollArea className="w-full pb-4 flex-1">
              <div className="flex gap-3 p-1">
                {colunas.map(coluna => {
                  const clientesColuna = clientesFiltrados.filter(c => c.status === coluna.id);
                  return (
                    <ColunaKanban
                      key={coluna.id}
                      id={coluna.id}
                      titulo={coluna.titulo}
                      cor={coluna.cor}
                      clientes={clientesColuna}
                      total={clientesColuna.length}
                    />
                  );
                })}
              </div>
            </ScrollArea>
            
            <DragOverlay>
              {activeCliente ? <CartaoCliente cliente={activeCliente} /> : null}
            </DragOverlay>
          </DndContext>

          {/* Barra inferior sempre visível */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              Dica: arraste os cards entre as colunas para atualizar o status. Clique no card para ver detalhes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelV2Page;
