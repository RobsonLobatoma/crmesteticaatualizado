import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { useLessons } from "./hooks/useLessons";
import { LessonFormModal } from "./components/LessonFormModal";
import { Lesson, LessonFormData } from "./types/Lesson";
import { RequireSuperAdmin } from "@/modules/super-admin-v2/components/RequireSuperAdmin";

export default function AulasPage() {
  const { lessons, loading, createLesson, updateLesson, deleteLesson, toggleActive } =
    useLessons();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const handleCreate = () => {
    setEditingLesson(null);
    setFormOpen(true);
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormOpen(true);
  };

  const handleSave = async (data: LessonFormData) => {
    if (editingLesson) {
      return await updateLesson(editingLesson.id, data);
    }
    return await createLesson(data);
  };

  const handleDelete = async () => {
    if (deletingLesson) {
      await deleteLesson(deletingLesson.id);
      setDeletingLesson(null);
    }
  };

  const extractYoutubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
  };

  return (
    <RequireSuperAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Aulas</h1>
            <p className="text-muted-foreground">
              Gerencie os vídeos de treinamento e tutoriais
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Vídeo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vídeos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum vídeo cadastrado. Clique em "Adicionar Vídeo" para começar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Ordem</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-24">Duração</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-32 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">
                        {lesson.display_order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lesson.title}</span>
                          {extractYoutubeId(lesson.youtube_url) && (
                            <a
                              href={lesson.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {lesson.description || "-"}
                      </TableCell>
                      <TableCell>
                        {lesson.duration ? (
                          <Badge variant="secondary">{lesson.duration}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={lesson.is_active}
                          onCheckedChange={(checked) =>
                            toggleActive(lesson.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(lesson)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletingLesson(lesson)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <LessonFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          lesson={editingLesson}
          onSave={handleSave}
        />

        <AlertDialog
          open={!!deletingLesson}
          onOpenChange={(open) => !open && setDeletingLesson(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o vídeo "{deletingLesson?.title}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RequireSuperAdmin>
  );
}
