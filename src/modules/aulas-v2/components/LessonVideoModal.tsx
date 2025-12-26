import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lesson } from "../types/Lesson";

interface LessonVideoModalProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (lessonId: string) => void;
}

export function LessonVideoModal({
  lesson,
  open,
  onOpenChange,
  onComplete,
}: LessonVideoModalProps) {
  const hasMarkedComplete = useRef(false);

  // Reset flag when lesson changes
  useEffect(() => {
    hasMarkedComplete.current = false;
  }, [lesson?.id]);

  // Mark as complete after 10 seconds of watching
  useEffect(() => {
    if (!open || !lesson || hasMarkedComplete.current) return;

    const timer = setTimeout(() => {
      if (onComplete && !hasMarkedComplete.current) {
        hasMarkedComplete.current = true;
        onComplete(lesson.id);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [open, lesson, onComplete]);

  if (!lesson) return null;

  // Extract video embed URL
  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Panda Video
    const pandaMatch = url.match(/player-vz-([a-z0-9-]+)\.tv\.pandavideo\.com\.br\/embed\/\?v=([a-z0-9-]+)/i);
    if (pandaMatch) {
      return url;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(lesson.youtube_url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Video embed */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                <p>Não foi possível carregar o vídeo.</p>
                <a
                  href={lesson.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                >
                  Abrir link externo
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {lesson.description && (
            <p className="mt-4 text-muted-foreground">{lesson.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
