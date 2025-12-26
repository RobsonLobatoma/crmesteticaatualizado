import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Service } from "../hooks/useMasterData";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  price: z.coerce.number().min(0, "Preço deve ser positivo").optional(),
  duration_minutes: z.coerce.number().min(5, "Mínimo 5 minutos").max(480, "Máximo 8 horas").optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSave: (data: Partial<Service>) => Promise<boolean>;
  userId: string;
}

export function ServiceFormModal({ open, onOpenChange, service, onSave, userId }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!service;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      price: 0,
      duration_minutes: 60,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (service) {
        form.reset({
          name: service.name,
          price: service.price ?? 0,
          duration_minutes: service.duration_minutes ?? 60,
          is_active: service.is_active,
        });
      } else {
        form.reset({
          name: "",
          price: 0,
          duration_minutes: 60,
          is_active: true,
        });
      }
    }
  }, [open, service, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    const data = {
      name: values.name,
      price: values.price ?? null,
      duration_minutes: values.duration_minutes ?? 60,
      is_active: values.is_active,
      user_id: userId,
    };
    const success = await onSave(data);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Procedimento" : "Novo Procedimento"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do procedimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (minutos)</FormLabel>
                  <FormControl>
                    <Input type="text" inputMode="numeric" placeholder="60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Procedimento disponível para seleção
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
