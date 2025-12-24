import { Card, CardContent } from '@/components/ui/card';
import { EventoHistorico } from '@/types/crm';
import { 
  UserPlus, 
  MessageSquare, 
  ArrowRight, 
  Phone, 
  Mail, 
  FileText, 
  Tag, 
  CheckCircle,
  Circle 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AbaHistoricoProps {
  historico: EventoHistorico[];
}

export const AbaHistorico = ({ historico }: AbaHistoricoProps) => {
  const getIconeEvento = (tipo: string) => {
    const icones: Record<string, JSX.Element> = {
      lead_criado: <UserPlus className="h-4 w-4" />,
      mensagem_enviada: <MessageSquare className="h-4 w-4" />,
      status_alterado: <ArrowRight className="h-4 w-4" />,
      ligacao: <Phone className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      observacao: <FileText className="h-4 w-4" />,
      tag_adicionada: <Tag className="h-4 w-4" />,
      finalizado: <CheckCircle className="h-4 w-4" />
    };
    return icones[tipo] || <Circle className="h-4 w-4" />;
  };

  const getCorEvento = (tipo: string) => {
    const cores: Record<string, string> = {
      lead_criado: 'bg-blue-500/10 text-blue-600',
      mensagem_enviada: 'bg-purple-500/10 text-purple-600',
      status_alterado: 'bg-orange-500/10 text-orange-600',
      ligacao: 'bg-green-500/10 text-green-600',
      email: 'bg-cyan-500/10 text-cyan-600',
      observacao: 'bg-gray-500/10 text-gray-600',
      tag_adicionada: 'bg-pink-500/10 text-pink-600',
      finalizado: 'bg-emerald-500/10 text-emerald-600'
    };
    return cores[tipo] || 'bg-primary/10 text-primary';
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        {historico.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Circle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum evento no histórico ainda</p>
          </div>
        ) : (
          <div className="space-y-6">
            {historico.map((evento, index) => (
              <div key={evento.id} className="flex gap-4">
                {/* Linha vertical e ícone */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getCorEvento(evento.tipo)}`}>
                    {getIconeEvento(evento.tipo)}
                  </div>
                  {index < historico.length - 1 && (
                    <div className="h-full w-[2px] bg-border mt-2" />
                  )}
                </div>
                
                {/* Conteúdo do evento */}
                <div className="flex-1 pb-4">
                  <p className="font-medium">{evento.descricao}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{evento.usuario}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(evento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {evento.detalhes && (evento.detalhes.statusAnterior || evento.detalhes.tagAdicionada) && (
                    <div className="mt-2 text-sm bg-muted/50 p-3 rounded-lg border border-border/50">
                      {evento.detalhes.tagAdicionada && (
                        <span>Tag: <strong>{evento.detalhes.tagAdicionada}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
