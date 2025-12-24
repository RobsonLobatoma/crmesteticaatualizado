import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AppointmentWithRelations } from "../types";
import { AppointmentCard } from "./AppointmentCard";

interface DraggableAppointmentProps {
  appointment: AppointmentWithRelations;
  onClick: () => void;
  compact?: boolean;
}

export function DraggableAppointment({
  appointment,
  onClick,
  compact,
}: DraggableAppointmentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: { appointment },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      <AppointmentCard
        appointment={appointment}
        onClick={onClick}
        compact={compact}
      />
    </div>
  );
}
