import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { LeadTag } from "../types/Lead";
import { useLeadTags, CreateTagDTO } from "../hooks/useLeadTags";

const TAG_COLORS = [
  { name: "Azul", value: "bg-blue-500" },
  { name: "Vermelho", value: "bg-red-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Amarelo", value: "bg-amber-500" },
  { name: "Laranja", value: "bg-orange-500" },
  { name: "Roxo", value: "bg-purple-500" },
  { name: "Rosa", value: "bg-pink-500" },
  { name: "Cinza", value: "bg-gray-500" },
  { name: "Teal", value: "bg-teal-500" },
  { name: "Índigo", value: "bg-indigo-500" },
];

interface TagsManagerProps {
  onTagsChange?: () => void;
}

export const TagsManager = ({ onTagsChange }: TagsManagerProps) => {
  const { tags, createTag, updateTag, deleteTag } = useLeadTags();
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("bg-blue-500");
  const [editingTag, setEditingTag] = useState<LeadTag | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<LeadTag | null>(null);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    const dto: CreateTagDTO = {
      name: newTagName.trim(),
      color: newTagColor,
    };

    const result = await createTag(dto);
    if (result) {
      setNewTagName("");
      setNewTagColor("bg-blue-500");
      onTagsChange?.();
    }
  };

  const handleStartEdit = (tag: LeadTag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = async () => {
    if (!editingTag || !editName.trim()) return;

    await updateTag({
      id: editingTag.id,
      name: editName.trim(),
      color: editColor,
    });

    setEditingTag(null);
    setEditName("");
    setEditColor("");
    onTagsChange?.();
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditName("");
    setEditColor("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTag) return;

    await deleteTag(deleteConfirmTag.id);
    setDeleteConfirmTag(null);
    onTagsChange?.();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Gerenciar Tags
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Tags</DialogTitle>
            <DialogDescription>
              Crie, edite ou exclua tags personalizadas para classificar seus leads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Formulário para nova tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Nome da tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              />
              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {TAG_COLORS.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
              <Button size="icon" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de tags existentes */}
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Nenhuma tag cadastrada. Crie sua primeira tag acima.
                </p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-surface-subtle p-2"
                  >
                    {editingTag?.id === tag.id ? (
                      <>
                        <div className="flex flex-1 gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 flex-1"
                            onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                          />
                          <select
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          >
                            {TAG_COLORS.map((color) => (
                              <option key={color.value} value={color.value}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={handleSaveEdit}
                          >
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-4 w-4 rounded-full ${tag.color}`}
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium">{tag.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleStartEdit(tag)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmTag(tag)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteConfirmTag} onOpenChange={() => setDeleteConfirmTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tag "{deleteConfirmTag?.name}"? Esta ação
              não pode ser desfeita e a tag será removida de todos os leads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
