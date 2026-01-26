import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsappTemplate, WhatsappTemplateType, WhatsappTemplateTriggerType } from "../types";
import { Loader2 } from "lucide-react";

interface TemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: WhatsappTemplate | null;
  onSubmit: (data: {
    name: string;
    content: string;
    type: WhatsappTemplateType;
    trigger_type: WhatsappTemplateTriggerType;
    trigger_value: string;
    is_active: boolean;
  }) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function TemplateFormModal({
  open,
  onOpenChange,
  template,
  onSubmit,
  isSubmitting,
}: TemplateFormModalProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<WhatsappTemplateType>("manual");
  const [triggerType, setTriggerType] = useState<WhatsappTemplateTriggerType>("keyword");
  const [triggerValue, setTriggerValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setContent(template.content);
      setType(template.type);
      setTriggerType(template.trigger);
      setTriggerValue(template.triggerValue);
      setIsActive(template.active);
    } else {
      setName("");
      setContent("");
      setType("manual");
      setTriggerType("keyword");
      setTriggerValue("");
      setIsActive(true);
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) return;

    const success = await onSubmit({
      name: name.trim(),
      content: content.trim(),
      type,
      trigger_type: triggerType,
      trigger_value: triggerValue.trim(),
      is_active: isActive,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {template ? "Editar Template" : "Novo Template"}
            </DialogTitle>
            <DialogDescription>
              {template
                ? "Atualize as informações do template de mensagem."
                : "Crie um novo template para envio rápido de mensagens."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do template</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Boas-vindas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo da mensagem</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo da mensagem..."
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                Dica: Use {"{nome}"} para personalizar com o nome do cliente.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as WhatsappTemplateType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_type">Gatilho</Label>
                <Select
                  value={triggerType}
                  onValueChange={(v) => setTriggerType(v as WhatsappTemplateTriggerType)}
                >
                  <SelectTrigger id="trigger_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Palavra-chave</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {type === "automatic" && (
              <div className="space-y-2">
                <Label htmlFor="trigger_value">
                  {triggerType === "keyword" ? "Palavra-chave" : "Nome do evento"}
                </Label>
                <Input
                  id="trigger_value"
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  placeholder={
                    triggerType === "keyword"
                      ? "Ex: oi, olá, preço"
                      : "Ex: novo_lead, agendamento"
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Template ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Templates inativos não são disparados automaticamente
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !content.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : template ? (
                "Salvar alterações"
              ) : (
                "Criar template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
