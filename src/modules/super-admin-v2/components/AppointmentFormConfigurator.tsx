import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AppointmentFormFieldConfig,
  AppointmentFormConfig,
  FIELD_DESCRIPTIONS,
} from "../types/appointmentFormConfig";
import { useAppointmentFormConfig } from "../hooks/useAppointmentFormConfig";

interface SortableFieldItemProps {
  field: AppointmentFormFieldConfig;
  onToggleVisible: (id: string) => void;
  onToggleRequired: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}

function SortableFieldItem({
  field,
  onToggleVisible,
  onToggleRequired,
  onUpdateLabel,
}: SortableFieldItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(field.label);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveLabel = () => {
    onUpdateLabel(field.id, editLabel);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditLabel(field.label);
    setIsEditing(false);
  };

  const isLocked = ["client", "date", "time", "professional"].includes(field.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${
        !field.visible ? "opacity-50" : ""
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="h-8"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={handleSaveLabel}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer"
            onDoubleClick={() => setIsEditing(true)}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{field.label}</span>
              {field.required && (
                <Badge variant="secondary" className="text-xs">
                  Obrigatório
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="text-xs">
                  Fixo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {FIELD_DESCRIPTIONS[field.id]}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor={`visible-${field.id}`} className="text-xs text-muted-foreground">
            Visível
          </Label>
          <Switch
            id={`visible-${field.id}`}
            checked={field.visible}
            onCheckedChange={() => onToggleVisible(field.id)}
            disabled={isLocked}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor={`required-${field.id}`} className="text-xs text-muted-foreground">
            Obrigatório
          </Label>
          <Switch
            id={`required-${field.id}`}
            checked={field.required}
            onCheckedChange={() => onToggleRequired(field.id)}
            disabled={isLocked || !field.visible}
          />
        </div>

        <button
          onClick={() => onToggleVisible(field.id)}
          className="text-muted-foreground hover:text-foreground"
          disabled={isLocked}
        >
          {field.visible ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

interface AppointmentFormConfiguratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentFormConfigurator({
  open,
  onOpenChange,
}: AppointmentFormConfiguratorProps) {
  const { config, isLoading, isSaving, saveConfig } = useAppointmentFormConfig();
  const [localConfig, setLocalConfig] = useState<AppointmentFormConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize local config when dialog opens
  const currentConfig = localConfig || config;

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalConfig({ ...config, fields: [...config.fields] });
    } else {
      setLocalConfig(null);
    }
    onOpenChange(newOpen);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalConfig((prev) => {
        if (!prev) return prev;
        const oldIndex = prev.fields.findIndex((f) => f.id === active.id);
        const newIndex = prev.fields.findIndex((f) => f.id === over.id);
        const newFields = arrayMove(prev.fields, oldIndex, newIndex).map(
          (f, idx) => ({ ...f, order: idx + 1 })
        );
        return { ...prev, fields: newFields };
      });
    }
  };

  const handleToggleVisible = (id: string) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) =>
          f.id === id ? { ...f, visible: !f.visible, required: !f.visible ? f.required : false } : f
        ),
      };
    });
  };

  const handleToggleRequired = (id: string) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) =>
          f.id === id ? { ...f, required: !f.required } : f
        ),
      };
    });
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => (f.id === id ? { ...f, label } : f)),
      };
    });
  };

  const handleSave = async () => {
    if (localConfig) {
      const success = await saveConfig(localConfig);
      if (success) {
        handleOpenChange(false);
      }
    }
  };

  const sortedFields = [...currentConfig.fields].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configurar Formulário de Agendamento</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Arraste para reordenar os campos. Clique duas vezes no nome para editar.
                Campos marcados como "Fixo" não podem ser ocultados.
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedFields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sortedFields.map((field) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        onToggleVisible={handleToggleVisible}
                        onToggleRequired={handleToggleRequired}
                        onUpdateLabel={handleUpdateLabel}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
