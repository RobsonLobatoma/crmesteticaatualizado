import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonFormData } from "../types/Lesson";
import { toast } from "sonner";

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setLessons((data as Lesson[]) || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Erro ao carregar aulas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const createLesson = async (formData: LessonFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("lessons").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        youtube_url: formData.youtube_url,
        duration: formData.duration || null,
        display_order: formData.display_order || 0,
      });

      if (error) throw error;
      toast.success("Vídeo adicionado com sucesso");
      await fetchLessons();
      return true;
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Erro ao adicionar vídeo");
      return false;
    }
  };

  const updateLesson = async (id: string, formData: LessonFormData) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: formData.title,
          description: formData.description || null,
          youtube_url: formData.youtube_url,
          duration: formData.duration || null,
          display_order: formData.display_order || 0,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Vídeo atualizado com sucesso");
      await fetchLessons();
      return true;
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast.error("Erro ao atualizar vídeo");
      return false;
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Vídeo excluído com sucesso");
      await fetchLessons();
      return true;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("Erro ao excluir vídeo");
      return false;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(isActive ? "Vídeo ativado" : "Vídeo desativado");
      await fetchLessons();
      return true;
    } catch (error) {
      console.error("Error toggling lesson:", error);
      toast.error("Erro ao alterar status");
      return false;
    }
  };

  return {
    lessons,
    loading,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    toggleActive,
  };
}
