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

// Converte texto livre para minutos
const parseDurationToMinutes = (input: string): number | null => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  
  // Formato "1h30" ou "1h30m" ou "1h 30"
  const hourMinMatch = trimmed.match(/^(\d+)\s*h\s*(\d+)?\s*m?i?n?$/);
  if (hourMinMatch) {
    const hours = parseInt(hourMinMatch[1], 10);
    const mins = hourMinMatch[2] ? parseInt(hourMinMatch[2], 10) : 0;
    return hours * 60 + mins;
  }
  
  // Formato "1:30" (hora:minuto)
  const colonMatch = trimmed.match(/^(\d+):(\d+)$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const mins = parseInt(colonMatch[2], 10);
    return hours * 60 + mins;
  }
  
  // Formato "90min" ou "90m" ou "90 minutos" ou apenas número
  const minMatch = trimmed.match(/^(\d+)\s*(min|m|minutos)?$/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }
  
  // Formato apenas "1h"
  const hourOnlyMatch = trimmed.match(/^(\d+)\s*h$/);
  if (hourOnlyMatch) {
    return parseInt(hourOnlyMatch[1], 10) * 60;
  }
  
  return null;
};

// Converte minutos para formato legível
const formatMinutesToDisplay = (minutes: number | null | undefined): string => {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  price: z.coerce.number().min(0, "Preço deve ser positivo").optional(),
  duration: z.string().optional(),
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
      duration: "1h",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (service) {
        form.reset({
          name: service.name,
          price: service.price ?? 0,
          duration: formatMinutesToDisplay(service.duration_minutes),
          is_active: service.is_active,
        });
      } else {
        form.reset({
          name: "",
          price: 0,
          duration: "1h",
          is_active: true,
        });
      }
    }
  }, [open, service, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    
    // Converte o texto de duração para minutos
    const durationMinutes = values.duration 
      ? parseDurationToMinutes(values.duration) 
      : 60;
    
    const data = {
      name: values.name,
      price: values.price ?? null,
      duration_minutes: durationMinutes ?? 60,
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
                    <Input type="text" inputMode="decimal" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="1h30, 1:30, 90min, 2h" 
                      {...field} 
                    />
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
