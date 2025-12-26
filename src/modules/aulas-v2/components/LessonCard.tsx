import { Play, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lesson } from "../types/Lesson";

interface LessonCardProps {
  lesson: Lesson;
  isSuperAdmin: boolean;
  isCompleted?: boolean;
  onPlay: (lesson: Lesson) => void;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
}

export function LessonCard({
  lesson,
  isSuperAdmin,
  isCompleted = false,
  onPlay,
  onEdit,
  onDelete,
}: LessonCardProps) {
  // Extract YouTube thumbnail if no custom thumbnail
  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const thumbnail =
    lesson.thumbnail_url || getYoutubeThumbnail(lesson.youtube_url) || "/placeholder.svg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30">
      {/* Thumbnail with play overlay */}
      <div
        className="relative aspect-video cursor-pointer overflow-hidden bg-muted"
        onClick={() => onPlay(lesson)}
      >
        <img
          src={thumbnail}
          alt={lesson.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-md">
            <CheckCircle2 className="h-3 w-3" />
            <span>Concluído</span>
          </div>
        )}

        {/* Duration badge */}
        {lesson.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            {lesson.duration}
          </span>
        )}

        {/* Admin actions (hover) */}
        {isSuperAdmin && (
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(lesson);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 text-destructive hover:bg-white hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(lesson);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-foreground">
            {lesson.title}
          </h3>
          {isCompleted && (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
          )}
        </div>
        {lesson.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {lesson.description}
          </p>
        )}
      </div>
    </div>
  );
}
