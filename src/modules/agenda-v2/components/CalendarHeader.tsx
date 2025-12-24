import { ChevronLeft, ChevronRight, CalendarDays, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarView } from "../types";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onTodayClick: () => void;
  onAbsenceClick: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onTodayClick,
  onAbsenceClick,
}: CalendarHeaderProps) {
  const handlePrev = () => {
    switch (view) {
      case "day":
        onDateChange(subDays(currentDate, 1));
        break;
      case "week":
        onDateChange(subWeeks(currentDate, 1));
        break;
      case "month":
        onDateChange(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case "day":
        onDateChange(addDays(currentDate, 1));
        break;
      case "week":
        onDateChange(addWeeks(currentDate, 1));
        break;
      case "month":
        onDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  const getDateLabel = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case "week":
        return format(currentDate, "'Semana de' d 'de' MMMM", { locale: ptBR });
      case "month":
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="ml-2 text-lg font-semibold capitalize text-foreground">
          {getDateLabel()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onTodayClick}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Hoje
        </Button>
        <Button variant="outline" size="sm" onClick={onAbsenceClick}>
          <UserX className="mr-2 h-4 w-4" />
          Ausência
        </Button>
        <div className="flex rounded-md border border-border">
          {(["day", "week", "month"] as CalendarView[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "ghost"}
              size="sm"
              className="rounded-none first:rounded-l-md last:rounded-r-md"
              onClick={() => onViewChange(v)}
            >
              {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
