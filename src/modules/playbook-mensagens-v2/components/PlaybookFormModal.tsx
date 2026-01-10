import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PlaybookCategory } from "../types/Playbook";

interface PlaybookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PlaybookCategory;
  editingItem?: Record<string, string> | null;
  onSubmit: (data: Record<string, string>) => void;
  isLoading?: boolean;
}

const categoryFields: Record<PlaybookCategory, { name: string; label: string; multiline?: boolean }[]> = {
  protocolo: [
    { name: "etapa", label: "Etapa" },
    { name: "objetivo", label: "Objetivo" },
    { name: "script", label: "Script/Ação Chave", multiline: true },
  ],
  sondagem: [
    { name: "categoria", label: "Categoria" },
    { name: "pergunta", label: "Pergunta/Frase Chave", multiline: true },
    { name: "objetivo", label: "Objetivo no CRM" },
  ],
  fechamento: [
    { name: "acao", label: "Ação" },
    { name: "script", label: "Script/Frase Chave", multiline: true },
    { name: "observacao", label: "Observação para o CRM" },
  ],
  objecoes: [
    { name: "categoria", label: "Categoria" },
    { name: "objecaoComum", label: "Objeção Comum" },
    { name: "estrategia", label: "Estratégia de Resposta" },
    { name: "scriptExemplo", label: "Script de Exemplo", multiline: true },
  ],
  depoimentos: [
    { name: "objecao", label: "Objeção a Superar" },
    { name: "depoimento", label: "Depoimento Chave", multiline: true },
  ],
};

const categoryTitles: Record<PlaybookCategory, string> = {
  protocolo: "Protocolo de Atendimento",
  sondagem: "Sondagem",
  fechamento: "Fechamento",
  objecoes: "Objeção",
  depoimentos: "Depoimento",
};

export function PlaybookFormModal({
  open,
  onOpenChange,
  category,
  editingItem,
  onSubmit,
  isLoading,
}: PlaybookFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (open) {
      if (editingItem) {
        reset(editingItem);
      } else {
        reset({});
      }
    }
  }, [open, editingItem, reset]);

  const fields = categoryFields[category];
  const title = editingItem
    ? `Editar ${categoryTitles[category]}`
    : `Adicionar ${categoryTitles[category]}`;

  const handleFormSubmit = (data: Record<string, string>) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.multiline ? (
                <Textarea
                  id={field.name}
                  {...register(field.name, { required: true })}
                  placeholder={`Digite ${field.label.toLowerCase()}...`}
                  rows={4}
                />
              ) : (
                <Input
                  id={field.name}
                  {...register(field.name, { required: true })}
                  placeholder={`Digite ${field.label.toLowerCase()}...`}
                />
              )}
              {errors[field.name] && (
                <p className="text-sm text-destructive">Campo obrigatório</p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
