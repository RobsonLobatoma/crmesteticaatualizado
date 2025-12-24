import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mensagem } from '@/types/crm';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface MensagemChatProps {
  mensagem: Mensagem;
}

const MensagemChat = ({ mensagem }: MensagemChatProps) => {
  const isCliente = mensagem.remetente === 'cliente';
  
  return (
    <div className={cn(
      "flex gap-3",
      !isCliente && "flex-row-reverse"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {mensagem.nomeRemetente.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        !isCliente && "items-end"
      )}>
        <div className="text-xs text-muted-foreground">
          {mensagem.nomeRemetente} • {mensagem.horario}
        </div>
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm",
          isCliente 
            ? "bg-muted text-foreground rounded-tl-none" 
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}>
          {mensagem.texto}
        </div>
      </div>
    </div>
  );
};

interface AbaChatConversaProps {
  mensagens: Mensagem[];
  novaMensagem: string;
  setNovaMensagem: (msg: string) => void;
  onEnviar: () => void;
}

export const AbaChatConversa = ({ 
  mensagens, 
  novaMensagem, 
  setNovaMensagem, 
  onEnviar 
}: AbaChatConversaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-scroll para última mensagem
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [mensagens]);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnviar();
    }
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      {/* Área de mensagens */}
      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        <div className="space-y-4">
          {mensagens.map((msg) => (
            <MensagemChat key={msg.id} mensagem={msg} />
          ))}
        </div>
      </ScrollArea>
      
      {/* Input de nova mensagem */}
      <Separator />
      <div className="p-4 flex gap-2">
        <Textarea
          placeholder="Digite sua mensagem..."
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          onKeyDown={handleKeyPress}
          className="min-h-[60px] resize-none"
        />
        <Button 
          onClick={onEnviar}
          disabled={!novaMensagem.trim()}
          className="self-end"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
