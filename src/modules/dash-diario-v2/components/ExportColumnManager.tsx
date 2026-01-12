import { useState, useEffect } from "react";
import { Settings2, GripVertical, RotateCcw, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export interface ExportColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

interface SortableItemProps {
  column: ExportColumnConfig;
  onToggle: (id: string) => void;
}

const SortableItem = ({ column, onToggle }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 hover:bg-muted/40"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Checkbox
        id={column.id}
        checked={column.visible}
        onCheckedChange={() => onToggle(column.id)}
      />
      <label
        htmlFor={column.id}
        className="flex-1 cursor-pointer text-xs font-medium"
      >
        {column.label}
      </label>
    </div>
  );
};

export const DEFAULT_EXPORT_COLUMNS: ExportColumnConfig[] = [
  { id: "data", label: "Data", visible: true },
  { id: "leadsNovosTotal", label: "Leads Novos (Total)", visible: true },
  { id: "leadsNovosWhatsapp", label: "Leads Novos (WhatsApp)", visible: true },
  { id: "leadsNovosInstagram", label: "Leads Novos (Instagram)", visible: true },
  { id: "conversadosTotal", label: "Conversados (Total)", visible: true },
  { id: "conversadosWhatsapp", label: "Conversados (WhatsApp)", visible: true },
  { id: "conversadosInstagram", label: "Conversados (Instagram)", visible: true },
  { id: "followUpTotal", label: "Follow-up (Total)", visible: true },
  { id: "agendadasHojeTotal", label: "Agendadas Hoje", visible: true },
  { id: "avaliacoesHoje", label: "Avaliações Hoje", visible: true },
  { id: "compareceramHoje", label: "Compareceram Hoje", visible: true },
  { id: "showRatePercent", label: "Show Rate %", visible: true },
  { id: "fechamentosHoje", label: "Fechamentos Hoje", visible: true },
  { id: "valorFechadoHoje", label: "R$ Fechado Hoje", visible: true },
];

const STORAGE_KEY = "dash-diario-export-config";

export const loadExportConfig = (): ExportColumnConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ExportColumnConfig[];
      const storedIds = new Set(parsed.map((c) => c.id));
      const merged = [...parsed];
      DEFAULT_EXPORT_COLUMNS.forEach((col) => {
        if (!storedIds.has(col.id)) {
          merged.push(col);
        }
      });
      return merged;
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_EXPORT_COLUMNS;
};

export const saveExportConfig = (config: ExportColumnConfig[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

interface ExportColumnManagerProps {
  columns: ExportColumnConfig[];
  onChange: (columns: ExportColumnConfig[]) => void;
}

export const ExportColumnManager = ({ columns, onChange }: ExportColumnManagerProps) => {
  const [localColumns, setLocalColumns] = useState<ExportColumnConfig[]>(columns);
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleToggle = (id: string) => {
    setLocalColumns((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalColumns((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    saveExportConfig(localColumns);
    onChange(localColumns);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalColumns(DEFAULT_EXPORT_COLUMNS);
  };

  const handleSelectAll = () => {
    setLocalColumns((prev) => prev.map((col) => ({ ...col, visible: true })));
  };

  const handleDeselectAll = () => {
    setLocalColumns((prev) => prev.map((col) => ({ ...col, visible: false })));
  };

  const selectedCount = localColumns.filter((c) => c.visible).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px] gap-1"
        >
          <Settings2 className="h-3 w-3" />
          Colunas Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Colunas para Exportação</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{selectedCount} de {localColumns.length} colunas selecionadas</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] gap-1"
              onClick={handleSelectAll}
            >
              <CheckSquare className="h-3 w-3" />
              Todas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] gap-1"
              onClick={handleDeselectAll}
            >
              <Square className="h-3 w-3" />
              Nenhuma
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localColumns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {localColumns.map((column) => (
                <SortableItem
                  key={column.id}
                  column={column}
                  onToggle={handleToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex items-center justify-between border-t pt-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar padrão
          </Button>
          <Button size="sm" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
