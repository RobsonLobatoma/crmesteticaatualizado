import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CRMResponsible } from '../hooks/useCRMResponsibles';

const responsibleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
});

type ResponsibleFormData = z.infer<typeof responsibleSchema>;

interface ResponsibleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responsible?: CRMResponsible | null;
  onSubmit: (data: ResponsibleFormData) => void;
  isLoading?: boolean;
}

export function ResponsibleFormModal({ open, onOpenChange, responsible, onSubmit, isLoading }: ResponsibleFormModalProps) {
  const form = useForm<ResponsibleFormData>({
    resolver: zodResolver(responsibleSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (responsible) {
      form.reset({ name: responsible.name });
    } else {
      form.reset({ name: '' });
    }
  }, [responsible, form]);

  const handleSubmit = (data: ResponsibleFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{responsible ? 'Editar Responsável' : 'Novo Responsável'}</DialogTitle>
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
                    <Input {...field} placeholder="Ex: João Silva" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {responsible ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
