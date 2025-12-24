import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StatusLead, ClientePotencial } from '@/types/crm';
import { CartaoCliente } from './CartaoCliente';

interface ColunaKanbanProps {
  id: StatusLead;
  titulo: string;
  cor: string;
  clientes: ClientePotencial[];
  total: number;
}

export const ColunaKanban = ({ id, titulo, cor, clientes, total }: ColunaKanbanProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Header da coluna */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", cor)} />
          <h3 className="font-semibold text-sm">{titulo}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {total}
        </Badge>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl border-2 border-dashed p-2 space-y-2 min-h-[200px] transition-colors",
          "border-border/50 bg-background/50",
          isOver && "bg-muted/50 border-primary/50"
        )}
      >
        {clientes.map(cliente => (
          <CartaoCliente key={cliente.id} cliente={cliente} />
        ))}
        
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
