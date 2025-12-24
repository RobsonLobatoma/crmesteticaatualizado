import { format, parseISO } from "date-fns";
import { AppointmentWithRelations } from "../types";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onClick: () => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, onClick, compact }: AppointmentCardProps) {
  const startTime = format(parseISO(appointment.start_datetime), "HH:mm");
  const clientName = appointment.client?.name ?? "Cliente";
  const serviceName = appointment.service?.name ?? "";
  const professionalColor = appointment.professional?.color ?? "#3B82F6";

  const statusColors: Record<string, string> = {
    agendado: "bg-blue-500/20 border-blue-500",
    confirmado: "bg-green-500/20 border-green-500",
    em_atendimento: "bg-yellow-500/20 border-yellow-500",
    concluido: "bg-gray-500/20 border-gray-500",
    cancelado: "bg-red-500/20 border-red-500",
    no_show: "bg-orange-500/20 border-orange-500",
  };

  const statusClass = statusColors[appointment.status ?? "agendado"] ?? statusColors.agendado;

  if (compact) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "absolute inset-x-0.5 inset-y-0.5 cursor-pointer overflow-hidden rounded border-l-2 px-1 py-0.5 text-xs transition-all hover:z-10 hover:shadow-md",
          statusClass
        )}
        style={{ borderLeftColor: professionalColor }}
      >
        <span className="font-medium line-clamp-1">{clientName}</span>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute inset-x-1 inset-y-0.5 cursor-pointer overflow-hidden rounded-md border-l-4 px-2 py-1 transition-all hover:z-10 hover:shadow-lg",
        statusClass
      )}
      style={{ borderLeftColor: professionalColor }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{startTime}</span>
      </div>
      <p className="text-sm font-medium line-clamp-1">{clientName}</p>
      {serviceName && (
        <p className="text-xs text-muted-foreground line-clamp-1">{serviceName}</p>
      )}
    </div>
  );
}
