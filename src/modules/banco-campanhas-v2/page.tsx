import { useEffect, useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { CAMPAIGN_COLUMNS } from "./data/campaigns.mock";
import type { CampaignCard, CampaignColumn } from "./types/Campaign";

const STORAGE_KEY = "banco-campanhas-columns-v1";

const CampaignFormSchema = z.object({
  title: z.string().min(1, { message: "Título é obrigatório" }).max(120),
  description: z
    .string()
    .max(2000, { message: "Descrição muito longa (máximo 2000 caracteres)" })
    .optional()
    .or(z.literal("")),
  date: z.date().optional(),
});

type CampaignFormValues = z.infer<typeof CampaignFormSchema>;

const BancoCampanhasV2Page = () => {
  useEffect(() => {
    document.title = "Banco de Campanhas | CRM Clínicas de Estética";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Kanban de campanhas para clínicas de estética venderem o ano todo.",
      );
    }
  }, []);

  const [columns, setColumns] = useState<CampaignColumn[]>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as CampaignColumn[];
      }
    } catch {
      // ignore
    }
    return CAMPAIGN_COLUMNS;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    } catch {
      // ignore
    }
  }, [columns]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignCard | null>(null);

  const activeColumn = useMemo(
    () => columns.find((column) => column.id === activeColumnId) ?? null,
    [columns, activeColumnId],
  );

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
    },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({ title: "", description: "", date: undefined });
      return;
    }

    if (editingCampaign) {
      form.reset({
        title: editingCampaign.title,
        description: editingCampaign.description ?? "",
        date: editingCampaign.date ? new Date(editingCampaign.date) : undefined,
      });
    } else {
      form.reset({ title: "", description: "", date: undefined });
    }
  }, [isDialogOpen, editingCampaign, form]);

  const handleAddCardClick = (columnId: string) => {
    setActiveColumnId(columnId);
    setEditingCampaign(null);
    setIsDialogOpen(true);
  };

  const handleEditCardClick = (columnId: string, campaign: CampaignCard) => {
    setActiveColumnId(columnId);
    setEditingCampaign(campaign);
    setIsDialogOpen(true);
  };

  const handleDeleteCard = (columnId: string, campaignId: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta campanha?");
    if (!confirmed) return;

    setColumns((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? { ...column, campaigns: column.campaigns.filter((c) => c.id !== campaignId) }
          : column,
      ),
    );
  };

  const onSubmit = (values: CampaignFormValues) => {
    if (!activeColumnId) return;

    const payload: CampaignCard = {
      id: editingCampaign?.id ?? crypto.randomUUID(),
      title: values.title,
      description: values.description || undefined,
      date: values.date ? values.date.toISOString() : undefined,
    };

    setColumns((prev) =>
      prev.map((column) => {
        if (column.id !== activeColumnId) return column;

        if (!editingCampaign) {
          return { ...column, campaigns: [...column.campaigns, payload] };
        }

        return {
          ...column,
          campaigns: column.campaigns.map((campaign) =>
            campaign.id === editingCampaign.id ? payload : campaign,
          ),
        };
      }),
    );

    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-1 max-w-full flex-col gap-6 px-4 py-6 lg:px-8 overflow-x-hidden">
      <header className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Banco de Campanhas</h1>
        <p className="text-sm text-muted-foreground">
          Visualize, crie e edite campanhas prontas para usar em cada mês do ano.
        </p>
      </header>

      <section aria-label="Kanban de campanhas do ano" className="flex-1">
        <div className="h-[calc(100vh-9rem)] w-full overflow-auto">
          <div className="flex w-max gap-4 pb-6">
            {columns.map((column) => (
              <Card
                key={column.id}
                className="flex h-full min-w-[260px] max-w-xs flex-1 flex-col border-border/70 bg-surface-elevated/95 shadow-soft"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Campanhas {column.month}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                  <div className="rounded-md bg-gradient-to-r from-primary via-primary/80 to-primary/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-soft">
                    <span className="block leading-tight">Campanhas</span>
                    <span className="block text-[10px] opacity-90">{column.month}</span>
                  </div>

                  <div className="mt-1 flex flex-1 flex-col gap-2">
                    {column.campaigns.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">
                        Nenhuma campanha cadastrada para este mês.
                      </p>
                    ) : (
                      column.campaigns.map((campaign) => (
                        <article
                          key={campaign.id}
                          className="rounded-md border border-border/70 bg-surface-subtle px-3 py-2 text-xs shadow-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <h3 className="text-[13px] font-semibold text-foreground">
                              {campaign.title}
                            </h3>
                            {campaign.description && (
                              <p className="text-[11px] leading-snug text-muted-foreground">
                                {campaign.description}
                              </p>
                            )}
                            {campaign.date && (
                              <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{format(new Date(campaign.date), "dd/MM/yyyy")}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[11px]"
                              onClick={() => handleEditCardClick(column.id, campaign)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[11px] text-destructive"
                              onClick={() => handleDeleteCard(column.id, campaign.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </article>
                      ))
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 inline-flex items-center justify-center border-dashed text-[11px] font-medium text-muted-foreground"
                      onClick={() => handleAddCardClick(column.id)}
                    >
                      + Adicionar um cartão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Editar campanha" : "Adicionar campanha"}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes da campanha para {activeColumn?.month?.toLowerCase() ?? "o mês"}.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Campanha de indicação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        maxLength={2000}
                        placeholder="Descrição rápida da oferta, condições e público alvo."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data sugerida</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            type="button"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingCampaign ? "Salvar alterações" : "Adicionar campanha"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BancoCampanhasV2Page;
