import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CRMStatus } from '../hooks/useCRMStatuses';

const statusSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Máximo 50 caracteres'),
  slug: z.string().min(1, 'Slug é obrigatório').max(30, 'Máximo 30 caracteres'),
  color: z.string().min(1, 'Cor é obrigatória'),
  display_order: z.number().int().min(0, 'Ordem deve ser positiva'),
});

type StatusFormData = z.infer<typeof statusSchema>;

const colorOptions = [
  { value: 'bg-blue-500', label: 'Azul', preview: 'bg-blue-500' },
  { value: 'bg-yellow-500', label: 'Amarelo', preview: 'bg-yellow-500' },
  { value: 'bg-orange-500', label: 'Laranja', preview: 'bg-orange-500' },
  { value: 'bg-green-500', label: 'Verde', preview: 'bg-green-500' },
  { value: 'bg-emerald-600', label: 'Esmeralda', preview: 'bg-emerald-600' },
  { value: 'bg-red-500', label: 'Vermelho', preview: 'bg-red-500' },
  { value: 'bg-purple-500', label: 'Roxo', preview: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Rosa', preview: 'bg-pink-500' },
  { value: 'bg-cyan-500', label: 'Ciano', preview: 'bg-cyan-500' },
  { value: 'bg-gray-500', label: 'Cinza', preview: 'bg-gray-500' },
];

interface StatusFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status?: CRMStatus | null;
  onSubmit: (data: StatusFormData) => void;
  isLoading?: boolean;
}

export function StatusFormModal({ open, onOpenChange, status, onSubmit, isLoading }: StatusFormModalProps) {
  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      name: '',
      slug: '',
      color: 'bg-blue-500',
      display_order: 0,
    },
  });

  useEffect(() => {
    if (status) {
      form.reset({
        name: status.name,
        slug: status.slug,
        color: status.color,
        display_order: status.display_order,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        color: 'bg-blue-500',
        display_order: 0,
      });
    }
  }, [status, form]);

  const handleSubmit = (data: StatusFormData) => {
    onSubmit(data);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (!status) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      form.setValue('slug', slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{status ? 'Editar Status' : 'Novo Status'}</DialogTitle>
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
                    <Input
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Em qualificação"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificador (slug)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: em_qualificacao" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma cor">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${field.value}`} />
                            {colorOptions.find((c) => c.value === field.value)?.label}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.preview}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de exibição</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
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
                {status ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
