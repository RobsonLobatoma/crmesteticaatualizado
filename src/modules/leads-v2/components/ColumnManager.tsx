import { useState, useEffect } from "react";
import { Settings2, GripVertical, RotateCcw } from "lucide-react";
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

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

interface SortableItemProps {
  column: ColumnConfig;
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

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "#", label: "#", visible: true },
  { id: "dataEntrada", label: "Data Entrada", visible: true },
  { id: "responsavel", label: "Responsável", visible: true },
  { id: "nome", label: "Nome do Cliente", visible: true },
  { id: "contato", label: "Contato WhatsApp/@", visible: true },
  { id: "origem", label: "Origem", visible: true },
  { id: "procedimento", label: "Procedimento / Interesse", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "dataUltimoContato", label: "Data Último Contato", visible: true },
  { id: "dataAgendamento", label: "Data Agendamento (quando marcou)", visible: true },
  { id: "dataAvaliacao", label: "Data Avaliação (dia marcado)", visible: true },
  { id: "dataProcedimento", label: "Data Procedimento", visible: true },
  { id: "compareceu", label: "Compareceu?", visible: true },
  { id: "dataFechamento", label: "Data Fechamento", visible: true },
  { id: "valorFechado", label: "Valor Fechado (R$)", visible: true },
  { id: "dataNascimento", label: "Data de Nascimento", visible: true },
  { id: "cpf", label: "CPF", visible: true },
  { id: "cep", label: "CEP", visible: true },
  { id: "endereco", label: "Endereço", visible: true },
  { id: "numero", label: "Número", visible: true },
  { id: "bairro", label: "Bairro", visible: true },
  { id: "cidade", label: "Cidade", visible: true },
  { id: "estado", label: "Estado", visible: true },
  { id: "complemento", label: "Complemento", visible: true },
  { id: "tags", label: "Tags", visible: true },
  { id: "observacao", label: "Objeção / Observação", visible: true },
  { id: "acoes", label: "Ações", visible: true },
];

const STORAGE_KEY = "leads-column-config";

export const loadColumnConfig = (): ColumnConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ColumnConfig[];
      // Merge with defaults to handle new columns added later
      const storedIds = new Set(parsed.map((c) => c.id));
      const merged = [...parsed];
      DEFAULT_COLUMNS.forEach((col) => {
        if (!storedIds.has(col.id)) {
          merged.push(col);
        }
      });
      return merged;
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_COLUMNS;
};

export const saveColumnConfig = (config: ColumnConfig[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

interface ColumnManagerProps {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
}

export const ColumnManager = ({ columns, onChange }: ColumnManagerProps) => {
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>(columns);
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
    saveColumnConfig(localColumns);
    onChange(localColumns);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalColumns(DEFAULT_COLUMNS);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-auto h-8 rounded-full px-3 text-[11px] gap-1"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Colunas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Colunas</DialogTitle>
        </DialogHeader>

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
