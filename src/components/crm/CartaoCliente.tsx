import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ClientePotencial } from '@/types/crm';
import { Phone, Bell, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartaoClienteProps {
  cliente: ClientePotencial;
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

export const CartaoCliente = ({ cliente }: CartaoClienteProps) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: cliente.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    touchAction: 'none',
  } : { touchAction: 'none' as const };

  const handleClick = (e: React.MouseEvent) => {
    // Não navegar se estiver arrastando
    if (isDragging) return;
    navigate(`/kanbam/cliente-potencial/${cliente.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-50 z-50"
      )}
    >
      <Card 
        className={cn(
          "hover:shadow-lg transition-all duration-200 relative overflow-visible",
          isDragging && "shadow-2xl ring-2 ring-primary"
        )}
        onClick={handleClick}
      >
        <CardContent className="p-3 space-y-2">
          {/* Badges de notificação */}
          <div className="absolute -top-2 -right-2 flex gap-1">
            {cliente.urgente && (
              <Badge variant="destructive" className="shadow-md">
                <Bell className="h-3 w-3 mr-1" />
                Urgente
              </Badge>
            )}
            {cliente.mensagensNaoLidas > 0 && (
              <Badge className="bg-blue-500 hover:bg-blue-600 shadow-md">
                {cliente.mensagensNaoLidas} {cliente.mensagensNaoLidas === 1 ? 'nova' : 'novas'}
              </Badge>
            )}
          </div>

          {/* Avatar e Nome */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {cliente.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{cliente.nome}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {cliente.telefone}
              </p>
            </div>
          </div>

          {/* Última mensagem */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {cliente.ultimaMensagem}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/30 mt-1">
            <Badge variant="outline" className="text-xs">
              {cliente.responsavel || 'Sem responsável'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(cliente.dataCriacao)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
