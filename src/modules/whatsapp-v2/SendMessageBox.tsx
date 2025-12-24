import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

type SendMessageBoxProps = {
  onSend: (content: string) => void;
};

export const SendMessageBox = ({ onSend }: SendMessageBoxProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border/60 bg-background/80 p-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Digite uma mensagem para enviar pelo WhatsApp..."
        className="min-h-[60px] resize-none text-sm"
      />
      <div className="flex items-center justify-end gap-2">
        <Button type="submit" size="sm" className="gap-2 bg-primary text-primary-foreground shadow-soft">
          <Send className="h-3 w-3" />
          Enviar (mock)
        </Button>
      </div>
    </form>
  );
};
