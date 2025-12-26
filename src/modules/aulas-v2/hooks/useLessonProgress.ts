import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/AuthProvider";

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export function useLessonProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(true);

  // Fetch all progress for the current user
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, completed_at")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching lesson progress:", error);
        return;
      }

      const progressMap: Record<string, LessonProgress> = {};
      data?.forEach((item) => {
        progressMap[item.lesson_id] = item;
      });
      setProgress(progressMap);
    } catch (err) {
      console.error("Error fetching progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Mark a lesson as completed
  const markAsCompleted = useCallback(
    async (lessonId: string) => {
      if (!user) return;

      // Optimistic update
      setProgress((prev) => ({
        ...prev,
        [lessonId]: {
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
      }));

      try {
        const { error } = await supabase.from("lesson_progress").upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,lesson_id",
          }
        );

        if (error) {
          console.error("Error marking lesson as completed:", error);
          // Revert optimistic update on error
          fetchProgress();
        }
      } catch (err) {
        console.error("Error:", err);
        fetchProgress();
      }
    },
    [user, fetchProgress]
  );

  // Check if a lesson is completed
  const isCompleted = useCallback(
    (lessonId: string) => {
      return progress[lessonId]?.completed ?? false;
    },
    [progress]
  );

  // Calculate overall progress
  const getOverallProgress = useCallback(
    (totalLessons: number) => {
      const completedCount = Object.values(progress).filter(
        (p) => p.completed
      ).length;
      return {
        completed: completedCount,
        total: totalLessons,
        percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      };
    },
    [progress]
  );

  return {
    progress,
    loading,
    markAsCompleted,
    isCompleted,
    getOverallProgress,
    refetch: fetchProgress,
  };
}
