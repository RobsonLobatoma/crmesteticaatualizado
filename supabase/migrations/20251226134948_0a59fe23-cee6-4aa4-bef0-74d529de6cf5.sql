-- Add new columns to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'youtube',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT;