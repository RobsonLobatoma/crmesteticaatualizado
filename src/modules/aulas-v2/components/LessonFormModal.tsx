import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { Lesson, LessonFormData } from "../types/Lesson";

interface LessonFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: Lesson | null;
  onSave: (data: LessonFormData) => Promise<boolean>;
}

export function LessonFormModal({
  open,
  onOpenChange,
  lesson,
  onSave,
}: LessonFormModalProps) {
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    youtube_url: "",
    duration: "",
    display_order: 0,
    video_type: "youtube",
    category: "",
    thumbnail_url: "",
    attachment_name: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description || "",
        youtube_url: lesson.youtube_url,
        duration: lesson.duration || "",
        display_order: lesson.display_order,
        video_type: lesson.video_type || "youtube",
        category: lesson.category || "",
        thumbnail_url: lesson.thumbnail_url || "",
        attachment_name: lesson.attachment_name || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        youtube_url: "",
        duration: "",
        display_order: 0,
        video_type: "youtube",
        category: "",
        thumbnail_url: "",
        attachment_name: "",
      });
    }
  }, [lesson, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.youtube_url.trim()) {
      return;
    }

    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {lesson ? "Editar Aula" : "Nova Aula"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Aula *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Introdução ao Marketing Jurídico"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva o conteúdo da aula"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video_type">Tipo de Vídeo</Label>
              <Select
                value={formData.video_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, video_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="panda">Panda Video</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ex: Marketing, Jurídico"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube_url">URL do Vídeo *</Label>
            <Input
              id="youtube_url"
              value={formData.youtube_url}
              onChange={(e) =>
                setFormData({ ...formData, youtube_url: e.target.value })
              }
              placeholder="https://www.youtube.com/watch?v=... ou URL do Panda Video"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Ordem (opcional)</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: parseInt(e.target.value) || 0,
                })
              }
              placeholder="1, 2, 3..."
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">Thumbnail da Aula</Label>
            <div className="flex gap-2">
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_url: e.target.value })
                }
                placeholder="URL da imagem ou faça upload"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment_name">Anexo (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="attachment_name"
                value={formData.attachment_name}
                onChange={(e) =>
                  setFormData({ ...formData, attachment_name: e.target.value })
                }
                placeholder="Nome do anexo"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Salvando..."
                : lesson
                ? "Salvar"
                : "Criar Aula"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
