import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { PlaybookCategory } from "../types/Playbook";
import { PlaybookFormModal } from "./PlaybookFormModal";

interface Column {
  key: string;
  label: string;
  width?: string;
  copyable?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlaybookItem = any;

interface PlaybookSectionProps {
  title: string;
  description?: string;
  columns: Column[];
  data: PlaybookItem[];
  category: PlaybookCategory;
  hasUserData: boolean;
  onAdd: (data: Record<string, string>) => void;
  onEdit: (id: string, data: Record<string, string>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function PlaybookSection({
  title,
  description,
  columns,
  data,
  category,
  hasUserData,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
}: PlaybookSectionProps) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, string> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência.`,
      });
    });
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: PlaybookItem) => {
    setEditingItem(item as Record<string, string>);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData: Record<string, string>) => {
    if (editingItem?.id) {
      onEdit(editingItem.id, formData);
    } else {
      onAdd(formData);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className={col.width}>
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhuma mensagem cadastrada. Clique em "Adicionar" para começar.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow key={item.id || index}>
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={col.key === columns[0].key ? "font-medium" : "text-sm"}
                        >
                          {item[col.key]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {columns.find((c) => c.copyable) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const copyableCol = columns.find((c) => c.copyable);
                                if (copyableCol) {
                                  copyToClipboard(item[copyableCol.key], copyableCol.label);
                                }
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          {hasUserData && item.id && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <PlaybookFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={category}
        editingItem={editingItem}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
