import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import { Badge } from '@/components/ui/badge';
import { ClientePotencial, FiltrosKanban as FiltrosKanbanType } from '@/types/crm';
import { ColunaKanban } from '@/components/crm/ColunaKanban';
import { FiltrosKanban } from '@/components/crm/FiltrosKanban';
import { CartaoCliente } from '@/components/crm/CartaoCliente';
import { useToast } from '@/hooks/use-toast';
import { useCRMStatuses } from '../hooks/useCRMStatuses';
import { useCRMClients } from '../hooks/useCRMClients';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, BarChart3, CalendarCheck } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Buscar dados da agenda da semana
  const { data: weekAppointments = [] } = useQuery({
    queryKey: ['week-appointments'],
    queryFn: async () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_datetime', weekStart.toISOString())
        .lte('start_datetime', weekEnd.toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calcular taxa de conversão (clientes que "fecharam" / total de clientes dos últimos 30 dias)
  const conversionStats = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentClients = clients.filter(c => {
      const createdAt = c.data_criacao ? parseISO(c.data_criacao) : null;
      return createdAt && createdAt >= thirtyDaysAgo;
    });
    
    const closedClients = recentClients.filter(c => c.status === 'fechou');
    const rate = recentClients.length > 0 
      ? Math.round((closedClients.length / recentClients.length) * 100) 
      : 0;
    
    return {
      rate,
      total: recentClients.length,
      closed: closedClients.length,
      hasData: recentClients.length >= 5,
    };
  }, [clients]);

  // Calcular métricas da agenda da semana
  const weekStats = useMemo(() => {
    const confirmed = weekAppointments.filter((a: any) => a.status === 'confirmado' || a.status === 'agendado').length;
    const evaluations = weekAppointments.filter((a: any) => a.notes?.toLowerCase().includes('avaliação')).length;
    const returns = weekAppointments.filter((a: any) => a.notes?.toLowerCase().includes('retorno')).length;
    const closings = weekAppointments.filter((a: any) => a.status === 'concluido').length;
    
    return { confirmed, evaluations, returns, closings };
  }, [weekAppointments]);

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
    // Filtro por data
    if (dateRange.from || dateRange.to) {
      const clienteDate = cliente.dataCriacao ? parseISO(cliente.dataCriacao) : null;
      if (!clienteDate) return false;
      
      if (dateRange.from && dateRange.to) {
        if (!isWithinInterval(clienteDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })) {
          return false;
        }
      } else if (dateRange.from) {
        if (clienteDate < startOfDay(dateRange.from)) return false;
      } else if (dateRange.to) {
        if (clienteDate > endOfDay(dateRange.to)) return false;
      }
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
    <div className="flex-1 px-4 pt-3 lg:px-8 flex flex-col">
      {/* Header compacto com título + métricas inline */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">Quadro de Atendimento</h1>
          <p className="text-xs text-muted-foreground">Gerencie seus leads através do funil de vendas</p>
        </div>
        
        {/* Filtro de data */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <CalendarIcon className="h-3.5 w-3.5" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>{format(dateRange.from, "dd/MM/yy", { locale: ptBR })} - {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}</>
                ) : format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              ) : "Filtrar por data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              locale={ptBR}
              numberOfMonths={2}
            />
            <div className="p-3 border-t flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>Limpar</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Métricas compactas em linha */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Clientes ativos</span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">AO VIVO</Badge>
            </div>
            <span className="text-2xl font-bold leading-tight">{clientesFiltrados.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Conversão (30d)</span>
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold leading-tight">{conversionStats.rate}%</span>
              {!conversionStats.hasData && <span className="text-[10px] text-muted-foreground">Sem dados</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Agenda da semana</span>
              <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold leading-tight">{weekStats.confirmed}</span>
              <span className="text-[10px] text-muted-foreground">confirmadas</span>
            </div>
            <div className="flex gap-2 text-[10px] text-muted-foreground">
              <span className="text-primary">{weekStats.evaluations} aval.</span>
              <span>{weekStats.returns} ret.</span>
              <span>{weekStats.closings} fech.</span>
            </div>
          </div>
        </div>
      </div>

      <FiltrosKanban filtros={filtros} onChange={setFiltros} />

      {/* Área principal do Kanban com scroll nativo */}
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 w-full overflow-auto">
          <div className="flex w-max gap-3 pb-6">
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
        </div>
        
        <DragOverlay>
          {activeCliente ? <CartaoCliente cliente={activeCliente} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Barra inferior com dica */}
      <div className="pt-3 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          Dica: arraste os cards entre as colunas para atualizar o status. Clique no card para ver detalhes.
        </p>
      </div>
    </div>
  );
};

export default PainelV2Page;
