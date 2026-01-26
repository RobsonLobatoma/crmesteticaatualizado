import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

type SendMessageBoxProps = {
  onSend: (content: string) => Promise<boolean> | void;
  disabled?: boolean;
  isSending?: boolean;
};

export const SendMessageBox = ({ onSend, disabled, isSending }: SendMessageBoxProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isSending || disabled) return;
    
    const result = await onSend(trimmed);
    if (result !== false) {
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border/60 bg-background/80 p-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Digite uma mensagem para enviar pelo WhatsApp..."
        className="min-h-[60px] resize-none text-sm"
        disabled={disabled || isSending}
      />
      <div className="flex items-center justify-end gap-2">
        <Button 
          type="submit" 
          size="sm" 
          className="gap-2 bg-primary text-primary-foreground shadow-soft"
          disabled={!value.trim() || disabled || isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-3 w-3" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
