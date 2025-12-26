export interface Lesson {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  duration: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonFormData {
  title: string;
  description?: string;
  youtube_url: string;
  duration?: string;
  display_order?: number;
}
