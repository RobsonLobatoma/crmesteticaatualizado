export interface Lesson {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  duration: string | null;
  display_order: number;
  is_active: boolean;
  video_type: string | null;
  category: string | null;
  thumbnail_url: string | null;
  attachment_name: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonFormData {
  title: string;
  description: string;
  youtube_url: string;
  duration: string;
  display_order: number;
  video_type: string;
  category: string;
  thumbnail_url: string;
  attachment_name: string;
}
