import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { BusinessHoursConfig } from "../hooks/useBusinessHoursConfig";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: BusinessHoursConfig;
  onSave: (config: BusinessHoursConfig) => Promise<boolean>;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const INTERVALS = [15, 30, 45, 60];
const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export function BusinessHoursFormModal({ open, onOpenChange, config, onSave }: Props) {
  const [formData, setFormData] = useState<BusinessHoursConfig>(config);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSubmit = async () => {
    setIsSaving(true);
    const success = await onSave(formData);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day].sort(),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Horários de Funcionamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Opening/Closing Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora de Abertura</Label>
              <Select
                value={formData.start_hour.toString()}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, start_hour: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hora de Fechamento</Label>
              <Select
                value={formData.end_hour.toString()}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, end_hour: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slot Interval */}
          <div className="space-y-2">
            <Label>Intervalo entre Horários</Label>
            <Select
              value={formData.slot_interval.toString()}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, slot_interval: parseInt(v) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} minutos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Working Days */}
          <div className="space-y-2">
            <Label>Dias de Funcionamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.working_days.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="cursor-pointer font-normal">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Lunch Break */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Intervalo de Almoço</Label>
              <Switch
                checked={formData.lunch_break.enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    lunch_break: { ...prev.lunch_break, enabled: checked },
                  }))
                }
              />
            </div>

            {formData.lunch_break.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Início</Label>
                  <Select
                    value={formData.lunch_break.start}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        lunch_break: { ...prev.lunch_break, start: v },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={`${h.toString().padStart(2, "0")}:00`}>
                          {h.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fim</Label>
                  <Select
                    value={formData.lunch_break.end}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        lunch_break: { ...prev.lunch_break, end: v },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={`${h.toString().padStart(2, "0")}:00`}>
                          {h.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
