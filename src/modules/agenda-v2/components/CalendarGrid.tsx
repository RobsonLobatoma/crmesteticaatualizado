import { useMemo } from "react";
import { format, isSameDay, parseISO, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithRelations, CalendarView, Professional } from "../types";
import { DraggableAppointment } from "./DraggableAppointment";
import { DroppableSlot } from "./DroppableSlot";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  currentDate: Date;
  view: CalendarView;
  appointments: AppointmentWithRelations[];
  professionals: Professional[];
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
  onSlotClick: (date: Date, time: string, professionalId?: string) => void;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return {
    time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    hour,
    minute,
  };
}).filter((slot) => slot.hour >= 8 && slot.hour < 20);

export function CalendarGrid({
  currentDate,
  view,
  appointments,
  professionals,
  onAppointmentClick,
  onSlotClick,
}: CalendarGridProps) {
  const weekDays = useMemo(() => {
    if (view !== "week") return [];
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate, view]);

  const getAppointmentsForSlot = (date: Date, time: string, professionalId?: string) => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.start_datetime);
      const aptTime = format(aptDate, "HH:mm");
      const sameDay = isSameDay(aptDate, date);
      const sameTime = aptTime === time;
      const sameProfessional = !professionalId || apt.professional_id === professionalId;
      return sameDay && sameTime && sameProfessional;
    });
  };

  if (view === "day") {
    return (
      <div className="flex flex-1 overflow-hidden rounded-lg border border-border bg-card">
        {/* Time column */}
        <div className="w-16 shrink-0 border-r border-border bg-muted/30">
          <div className="h-12 border-b border-border" />
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.time}
              className="flex h-16 items-start justify-end border-b border-border/50 pr-2 pt-1 text-xs text-muted-foreground"
            >
              {slot.time}
            </div>
          ))}
        </div>

        {/* Professional columns */}
        <div className="flex flex-1 overflow-x-auto">
          {professionals.length === 0 ? (
            <div className="flex flex-1 flex-col">
              <div className="flex h-12 items-center justify-center border-b border-border bg-muted/50 px-4 text-sm font-medium">
                Todos
              </div>
              {TIME_SLOTS.map((slot) => {
                const slotAppointments = getAppointmentsForSlot(currentDate, slot.time);
                const slotId = `slot-${format(currentDate, "yyyy-MM-dd")}-${slot.time}`;
                return (
                  <DroppableSlot
                    key={slot.time}
                    id={slotId}
                    date={currentDate}
                    time={slot.time}
                    onClick={() => onSlotClick(currentDate, slot.time)}
                    className="relative h-16 border-b border-border/50 hover:bg-accent/10 cursor-pointer"
                  >
                    {slotAppointments.map((apt) => (
                      <DraggableAppointment
                        key={apt.id}
                        appointment={apt}
                        onClick={() => onAppointmentClick(apt)}
                      />
                    ))}
                  </DroppableSlot>
                );
              })}
            </div>
          ) : (
            professionals.map((prof) => (
              <div key={prof.id} className="flex min-w-[180px] flex-1 flex-col">
                <div
                  className="flex h-12 items-center justify-center border-b border-r border-border px-4 text-sm font-medium"
                  style={{ backgroundColor: `${prof.color}20` }}
                >
                  {prof.name}
                </div>
                {TIME_SLOTS.map((slot) => {
                  const slotAppointments = getAppointmentsForSlot(currentDate, slot.time, prof.id);
                  const slotId = `slot-${format(currentDate, "yyyy-MM-dd")}-${slot.time}-${prof.id}`;
                  return (
                    <DroppableSlot
                      key={`${prof.id}-${slot.time}`}
                      id={slotId}
                      date={currentDate}
                      time={slot.time}
                      professionalId={prof.id}
                      onClick={() => onSlotClick(currentDate, slot.time, prof.id)}
                      className="relative h-16 border-b border-r border-border/50 hover:bg-accent/10 cursor-pointer"
                    >
                      {slotAppointments.map((apt) => (
                        <DraggableAppointment
                          key={apt.id}
                          appointment={apt}
                          onClick={() => onAppointmentClick(apt)}
                        />
                      ))}
                    </DroppableSlot>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === "week") {
    return (
      <div className="flex flex-1 overflow-hidden rounded-lg border border-border bg-card">
        {/* Time column */}
        <div className="w-16 shrink-0 border-r border-border bg-muted/30">
          <div className="h-12 border-b border-border" />
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.time}
              className="flex h-12 items-start justify-end border-b border-border/50 pr-2 pt-1 text-xs text-muted-foreground"
            >
              {slot.time}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1 overflow-x-auto">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="flex min-w-[120px] flex-1 flex-col">
              <div
                className={cn(
                  "flex h-12 flex-col items-center justify-center border-b border-r border-border px-2 text-sm",
                  isSameDay(day, new Date()) && "bg-primary/10"
                )}
              >
                <span className="text-xs text-muted-foreground capitalize">
                  {format(day, "EEE", { locale: ptBR })}
                </span>
                <span className="font-medium">{format(day, "d")}</span>
              </div>
              {TIME_SLOTS.map((slot) => {
                const slotAppointments = getAppointmentsForSlot(day, slot.time);
                const slotId = `slot-${format(day, "yyyy-MM-dd")}-${slot.time}`;
                return (
                  <DroppableSlot
                    key={`${day.toISOString()}-${slot.time}`}
                    id={slotId}
                    date={day}
                    time={slot.time}
                    onClick={() => onSlotClick(day, slot.time)}
                    className="relative h-12 border-b border-r border-border/50 hover:bg-accent/10 cursor-pointer"
                  >
                    {slotAppointments.map((apt) => (
                      <DraggableAppointment
                        key={apt.id}
                        appointment={apt}
                        compact
                        onClick={() => onAppointmentClick(apt)}
                      />
                    ))}
                  </DroppableSlot>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Month view
  return (
    <div className="flex-1 rounded-lg border border-border bg-card p-4">
      <p className="text-center text-muted-foreground">Visualização mensal em desenvolvimento</p>
    </div>
  );
}
