import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClientePotencial } from '@/types/crm';
import { CartaoCliente } from './CartaoCliente';
import { ChevronDown } from 'lucide-react';

interface ColunaKanbanProps {
  id: string;
  titulo: string;
  cor: string;
  clientes: ClientePotencial[];
  total: number;
}

const ITEMS_PER_PAGE = 10;

export const ColunaKanban = ({ id, titulo, cor, clientes, total }: ColunaKanbanProps) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const clientesVisiveis = clientes.slice(0, visibleCount);
  const temMais = clientes.length > visibleCount;
  const restantes = clientes.length - visibleCount;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Header da coluna */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", cor)} />
          <h3 className="font-semibold text-sm">{titulo}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {visibleCount < total ? `${Math.min(visibleCount, total)}/${total}` : total}
        </Badge>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl border-2 border-dashed p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto transition-colors",
          "border-border/50 bg-background/50",
          isOver && "bg-muted/50 border-primary/50"
        )}
      >
        {clientesVisiveis.map(cliente => (
          <CartaoCliente key={cliente.id} cliente={cliente} />
        ))}
        
        {temMais && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            Ver mais ({restantes} restantes)
          </Button>
        )}
        
        {clientes.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p className="text-center text-sm text-muted-foreground">
              Nenhum cliente nesta etapa
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
