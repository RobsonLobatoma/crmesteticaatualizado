import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusLead, ClientePotencial, FiltrosKanban as FiltrosKanbanType } from '@/types/crm';
import { ColunaKanban } from '@/components/crm/ColunaKanban';
import { FiltrosKanban } from '@/components/crm/FiltrosKanban';
import { CartaoCliente } from '@/components/crm/CartaoCliente';
import { useToast } from '@/hooks/use-toast';

const colunas = [
  { id: 'novo' as StatusLead, titulo: 'Novo', cor: 'bg-blue-500' },
  { id: 'qualificacao' as StatusLead, titulo: 'Em qualificação', cor: 'bg-yellow-500' },
  { id: 'aguardando' as StatusLead, titulo: 'Aguardando atendente', cor: 'bg-orange-500' },
  { id: 'atendimento' as StatusLead, titulo: 'Em atendimento', cor: 'bg-green-500' },
  { id: 'finalizado' as StatusLead, titulo: 'Finalizado', cor: 'bg-emerald-600' },
  { id: 'perdido' as StatusLead, titulo: 'Perdido', cor: 'bg-red-500' },
  { id: 'voltar' as StatusLead, titulo: 'Voltar contato', cor: 'bg-purple-500' },
];

const PainelV2Page = () => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<ClientePotencial[]>([]);
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const clienteId = active.id as string;
    const novoStatus = over.id as StatusLead;
    
    const cliente = clientes.find(c => c.id === clienteId);
    const statusAnterior = cliente?.status;
    
    if (statusAnterior && statusAnterior !== novoStatus && cliente) {
      const colunaDestino = colunas.find(col => col.id === novoStatus);
      
      setClientes(prevClientes => 
        prevClientes.map(c => 
          c.id === clienteId 
            ? { ...c, status: novoStatus }
            : c
        )
      );

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

  return (
    <div className="flex-1 px-4 pt-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quadro de Atendimento</h1>
        <p className="text-muted-foreground">Gerencie seus leads através do funil de vendas</p>
      </div>

      <FiltrosKanban filtros={filtros} onChange={setFiltros} />

      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="w-full pb-4">
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
    </div>
  );
};

export default PainelV2Page;
