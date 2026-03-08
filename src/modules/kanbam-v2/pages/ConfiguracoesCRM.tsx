import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Pencil, Trash2 } from 'lucide-react';
import { ConfiguracaoCRM } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';
import { useCRMStatuses, CRMStatus } from '../hooks/useCRMStatuses';
import { useCRMResponsibles, CRMResponsible } from '../hooks/useCRMResponsibles';
import { StatusFormModal } from '../components/StatusFormModal';
import { ResponsibleFormModal } from '../components/ResponsibleFormModal';
import { SortableStatusItem } from '../components/SortableStatusItem';
import { useAuth } from '@/integrations/supabase/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';


const ConfiguracoesCRMV2Page = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [config, setConfig] = useState<ConfiguracaoCRM>({
    atendimentoAutomatico: false,
    minutosVoltarContato: 30,
    notificarNovosLeads: true,
    notificarMudancasStatus: true
  });

  // Status hooks
  const { statuses, isLoading: loadingStatuses, createStatus, updateStatus, deleteStatus } = useCRMStatuses();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CRMStatus | null>(null);

  // Responsible hooks
  const { responsibles, isLoading: loadingResponsibles, createResponsible, updateResponsible, deleteResponsible } = useCRMResponsibles();
  const [responsibleModalOpen, setResponsibleModalOpen] = useState(false);
  const [editingResponsible, setEditingResponsible] = useState<CRMResponsible | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('configCRM');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const handleSalvar = () => {
    localStorage.setItem('configCRM', JSON.stringify(config));
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso."
    });
  };

  // Status handlers
  const handleCreateStatus = () => {
    setEditingStatus(null);
    setStatusModalOpen(true);
  };

  const handleEditStatus = (status: CRMStatus) => {
    setEditingStatus(status);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = (data: { name: string; slug: string; color: string; display_order: number }) => {
    if (!user?.id) return;
    
    if (editingStatus) {
      updateStatus.mutate({ id: editingStatus.id, ...data }, {
        onSuccess: () => setStatusModalOpen(false)
      });
    } else {
      createStatus.mutate({ ...data, user_id: user.id, is_active: true }, {
        onSuccess: () => setStatusModalOpen(false)
      });
    }
  };

  const handleDeleteStatus = (id: string) => {
    deleteStatus.mutate(id);
  };

  // Drag-and-drop sensors and handler
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = statuses.findIndex(s => s.id === active.id);
    const newIndex = statuses.findIndex(s => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(statuses, oldIndex, newIndex);
    reordered.forEach((status, index) => {
      if (status.display_order !== index) {
        updateStatus.mutate({ id: status.id, display_order: index });
      }
    });
  };

  // Responsible handlers
  const handleCreateResponsible = () => {
    setEditingResponsible(null);
    setResponsibleModalOpen(true);
  };

  const handleEditResponsible = (responsible: CRMResponsible) => {
    setEditingResponsible(responsible);
    setResponsibleModalOpen(true);
  };

  const handleResponsibleSubmit = (data: { name: string }) => {
    if (!user?.id) return;
    
    if (editingResponsible) {
      updateResponsible.mutate({ id: editingResponsible.id, ...data }, {
        onSuccess: () => setResponsibleModalOpen(false)
      });
    } else {
      createResponsible.mutate({ ...data, user_id: user.id, is_active: true }, {
        onSuccess: () => setResponsibleModalOpen(false)
      });
    }
  };

  const handleDeleteResponsible = (id: string) => {
    deleteResponsible.mutate(id);
  };

  return (
    <div className="flex-1 px-4 pt-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/kanbam/painel">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o painel
        </Link>
      </Button>

      <div className="grid gap-6 max-w-4xl">
        {/* Card de Status do Kanban */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Gerenciar Status</CardTitle>
                <CardDescription>
                  Configure os status disponíveis para as colunas do Kanban
                </CardDescription>
              </div>
              <Button onClick={handleCreateStatus} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Status
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStatuses ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : statuses.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum status cadastrado. Clique em "Novo Status" para criar.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={statuses.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {statuses.map((status) => (
                      <SortableStatusItem
                        key={status.id}
                        status={status}
                        onEdit={handleEditStatus}
                        onDelete={handleDeleteStatus}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Card de Responsáveis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Gerenciar Responsáveis</CardTitle>
                <CardDescription>
                  Configure os responsáveis disponíveis para atribuir aos leads
                </CardDescription>
              </div>
              <Button onClick={handleCreateResponsible} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Responsável
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingResponsibles ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : responsibles.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum responsável cadastrado. Clique em "Novo Responsável" para criar.</p>
            ) : (
              <div className="space-y-2">
                {responsibles.map((responsible) => (
                  <div
                    key={responsible.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {responsible.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium">{responsible.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditResponsible(responsible)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir responsável?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O responsável "{responsible.name}" será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteResponsible(responsible.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Configurações Gerais</CardTitle>
            <CardDescription>
              Configure as opções de automação e notificações do seu CRM
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Atendimento automático</Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, respostas automáticas serão enviadas aos novos leads
                </p>
              </div>
              <Switch
                checked={config.atendimentoAutomatico}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({ ...prev, atendimentoAutomatico: checked }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Minutos sem resposta para voltar contato
              </Label>
              <p className="text-sm text-muted-foreground">
                Após este período sem resposta, o lead será movido para "Voltar contato"
              </p>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  max="1440"
                  value={config.minutosVoltarContato}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      minutosVoltarContato: parseInt(e.target.value) || 30
                    }))
                  }
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base font-medium">Notificações</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificar novos leads</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba uma notificação quando um novo lead entrar no sistema
                  </p>
                </div>
                <Switch
                  checked={config.notificarNovosLeads}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({ ...prev, notificarNovosLeads: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificar mudanças de status</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba uma notificação quando um lead mudar de etapa
                  </p>
                </div>
                <Switch
                  checked={config.notificarMudancasStatus}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({ ...prev, notificarMudancasStatus: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button onClick={handleSalvar} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Salvar configurações
            </Button>
            <Button variant="outline" asChild>
              <Link to="/kanbam/painel">Cancelar</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modais */}
      <StatusFormModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        status={editingStatus}
        onSubmit={handleStatusSubmit}
        isLoading={createStatus.isPending || updateStatus.isPending}
      />

      <ResponsibleFormModal
        open={responsibleModalOpen}
        onOpenChange={setResponsibleModalOpen}
        responsible={editingResponsible}
        onSubmit={handleResponsibleSubmit}
        isLoading={createResponsible.isPending || updateResponsible.isPending}
      />
    </div>
  );
};

export default ConfiguracoesCRMV2Page;
