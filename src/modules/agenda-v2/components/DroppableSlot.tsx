import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DroppableSlotProps {
  id: string;
  date: Date;
  time: string;
  professionalId?: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export function DroppableSlot({
  id,
  date,
  time,
  professionalId,
  onClick,
  children,
  className,
}: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { date, time, professionalId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && "bg-primary/20 ring-2 ring-primary ring-inset"
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
