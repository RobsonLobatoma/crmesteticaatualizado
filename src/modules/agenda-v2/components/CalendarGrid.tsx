import { useMemo } from "react";
import { format, isSameDay, parseISO, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithRelations, CalendarView, Professional } from "../types";
import { DraggableAppointment } from "./DraggableAppointment";
import { DroppableSlot } from "./DroppableSlot";
import { cn } from "@/lib/utils";
import { useBusinessHours } from "../hooks/useBusinessHours";

interface CalendarGridProps {
  currentDate: Date;
  view: CalendarView;
  appointments: AppointmentWithRelations[];
  professionals: Professional[];
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
  onSlotClick: (date: Date, time: string, professionalId?: string) => void;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarGrid({
  currentDate,
  view,
  appointments,
  professionals,
  onAppointmentClick,
  onSlotClick,
}: CalendarGridProps) {
  const { timeSlots: TIME_SLOTS } = useBusinessHours();

  const weekDays = useMemo(() => {
    if (view !== "week") return [];
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate, view]);

  const monthDays = useMemo(() => {
    if (view !== "month") return [];
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Pad with empty slots at the beginning for alignment
    const firstDayOfWeek = getDay(start);
    const paddedDays: (Date | null)[] = Array(firstDayOfWeek).fill(null);
    return [...paddedDays, ...days];
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

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.start_datetime);
      return isSameDay(aptDate, date);
    });
  };

  if (view === "day") {
    return (
      <div className="flex flex-1 overflow-hidden rounded-lg border border-border bg-card">
        {/* Time column */}
        <div className="w-14 shrink-0 border-r border-border bg-muted/30">
          <div className="h-10 border-b border-border" />
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.time}
              className="flex h-12 items-start justify-end border-b border-border/50 pr-2 pt-0.5 text-[11px] text-muted-foreground"
            >
              {slot.time}
            </div>
          ))}
        </div>

        {/* Professional columns */}
        <div className="flex flex-1 overflow-x-auto">
          {professionals.length === 0 ? (
            <div className="flex flex-1 flex-col">
              <div className="flex h-10 items-center justify-center border-b border-border bg-muted/50 px-3 text-sm font-medium">
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
                    className="relative h-12 border-b border-border/50 hover:bg-accent/10 cursor-pointer"
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
              <div key={prof.id} className="flex min-w-[160px] flex-1 flex-col">
                <div
                  className="flex h-10 items-center justify-center border-b border-r border-border px-3 text-sm font-medium"
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
                      className="relative h-12 border-b border-r border-border/50 hover:bg-accent/10 cursor-pointer"
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
      <div className="flex flex-1 h-full overflow-hidden rounded-lg border border-border bg-card">
        {/* Time column */}
        <div className="w-14 shrink-0 border-r border-border bg-muted/30 flex flex-col">
          <div className="h-10 border-b border-border shrink-0" />
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.time}
              className="flex flex-1 items-start justify-end border-b border-border/50 pr-2 pt-0.5 text-[11px] text-muted-foreground min-h-[28px]"
            >
              {slot.time}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1 overflow-x-auto">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="flex min-w-[100px] flex-1 flex-col">
              <div
                className={cn(
                  "flex h-10 shrink-0 flex-col items-center justify-center border-b border-r border-border px-1 text-xs",
                  isSameDay(day, new Date()) && "bg-primary/10"
                )}
              >
                <span className="text-[10px] text-muted-foreground capitalize">
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
                    className="relative flex-1 min-h-[28px] border-b border-r border-border/50 hover:bg-accent/10 cursor-pointer"
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
    <div className="flex-1 rounded-lg border border-border bg-card overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 auto-rows-fr" style={{ minHeight: "calc(100% - 36px)" }}>
        {monthDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[100px] border-b border-r border-border/50 bg-muted/10"
              />
            );
          }

          const dayAppointments = getAppointmentsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] border-b border-r border-border/50 p-1 cursor-pointer hover:bg-accent/5 transition-colors",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground"
              )}
              onClick={() => onSlotClick(day, "09:00")}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayAppointments.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {dayAppointments.length} agend.
                  </span>
                )}
              </div>

              <div className="space-y-0.5 overflow-hidden">
                {dayAppointments.slice(0, 3).map((apt) => {
                  const aptTime = format(parseISO(apt.start_datetime), "HH:mm");
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] truncate cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: apt.professional?.color ? `${apt.professional.color}30` : "hsl(var(--primary) / 0.2)",
                        borderLeft: `2px solid ${apt.professional?.color ?? "hsl(var(--primary))"}`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                    >
                      <span className="font-medium">{aptTime}</span>
                      <span className="truncate">{apt.client?.name ?? "Cliente"}</span>
                    </div>
                  );
                })}
                {dayAppointments.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1">
                    +{dayAppointments.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
