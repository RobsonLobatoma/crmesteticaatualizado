import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { useLessons } from "./hooks/useLessons";
import { useLessonProgress } from "./hooks/useLessonProgress";
import { LessonFormModal } from "./components/LessonFormModal";
import { LessonCard } from "./components/LessonCard";
import { LessonVideoModal } from "./components/LessonVideoModal";
import { Lesson, LessonFormData } from "./types/Lesson";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

export default function AulasPage() {
  const { lessons, loading, createLesson, updateLesson, deleteLesson } =
    useLessons();
  const { isSuperAdmin, loading: loadingRole } = useIsSuperAdmin();
  const { isCompleted, markAsCompleted, getOverallProgress, loading: loadingProgress } =
    useLessonProgress();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [playingLesson, setPlayingLesson] = useState<Lesson | null>(null);

  // Filter lessons: super admins see all, regular users see only active
  const visibleLessons = useMemo(() => {
    if (isSuperAdmin) return lessons;
    return lessons.filter((lesson) => lesson.is_active);
  }, [lessons, isSuperAdmin]);

  // Calculate progress
  const overallProgress = useMemo(() => {
    return getOverallProgress(visibleLessons.length);
  }, [getOverallProgress, visibleLessons.length]);

  // Group lessons by category
  const lessonsByCategory = useMemo(() => {
    const groups: Record<string, Lesson[]> = {};

    visibleLessons.forEach((lesson) => {
      const category = lesson.category || "Geral";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(lesson);
    });

    // Sort lessons within each category by display_order
    Object.keys(groups).forEach((category) => {
      groups[category].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
    });

    return groups;
  }, [visibleLessons]);

  const categories = Object.keys(lessonsByCategory).sort();

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

  const handlePlay = (lesson: Lesson) => {
    setPlayingLesson(lesson);
  };

  const handleVideoComplete = (lessonId: string) => {
    markAsCompleted(lessonId);
  };

  if (loading || loadingRole || loadingProgress) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-8 lg:px-8 w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Aulas sobre a Plataforma
            </h1>
            <p className="text-muted-foreground">
              Capacite-se com nossos treinamentos exclusivos.
            </p>
          </div>
          {isSuperAdmin && (
            <Button onClick={handleCreate} className="self-start">
              <Plus className="mr-2 h-4 w-4" />
              Nova Aula
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        {visibleLessons.length > 0 && (
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">Seu progresso</span>
                <span className="text-muted-foreground">
                  {overallProgress.completed} de {overallProgress.total} aulas concluídas
                </span>
              </div>
              <Progress value={overallProgress.percentage} className="h-2" />
            </div>
            <span className="text-lg font-bold text-primary">
              {overallProgress.percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {visibleLessons.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? 'Nenhum vídeo cadastrado. Clique em "Nova Aula" para começar.'
              : "Nenhum treinamento disponível no momento."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {categories.map((category) => (
            <section key={category}>
              {/* Category header */}
              <div className="mb-4 flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {category}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Cards grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {lessonsByCategory[category].map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isSuperAdmin={isSuperAdmin}
                    isCompleted={isCompleted(lesson.id)}
                    onPlay={handlePlay}
                    onEdit={handleEdit}
                    onDelete={setDeletingLesson}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Video Modal */}
      <LessonVideoModal
        lesson={playingLesson}
        open={!!playingLesson}
        onOpenChange={(open) => !open && setPlayingLesson(null)}
        onComplete={handleVideoComplete}
      />

      {/* Form Modal (Super Admin only) */}
      {isSuperAdmin && (
        <LessonFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          lesson={editingLesson}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation (Super Admin only) */}
      {isSuperAdmin && (
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
      )}
    </div>
  );
}
