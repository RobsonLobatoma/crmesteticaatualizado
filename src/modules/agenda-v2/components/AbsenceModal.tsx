import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfessionals } from "../hooks/useProfessionals";
import { useAbsences } from "../hooks/useAbsences";
import { AbsenceFormData } from "../types";

interface AbsenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AbsenceModal({ open, onOpenChange }: AbsenceModalProps) {
  const { professionals } = useProfessionals();
  const { createAbsence, isCreating } = useAbsences();

  const [formData, setFormData] = useState<AbsenceFormData>({
    professional_id: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    absence_type: "day",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAbsence(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          professional_id: "",
          start_date: "",
          end_date: "",
          start_time: "",
          end_time: "",
          absence_type: "day",
          reason: "",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Ausência</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Profissional *</Label>
            <Select
              value={formData.professional_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, professional_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Ausência</Label>
            <Select
              value={formData.absence_type}
              onValueChange={(value: "day" | "period") =>
                setFormData((prev) => ({ ...prev, absence_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia inteiro</SelectItem>
                <SelectItem value="period">Período específico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {formData.absence_type === "period" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Input
                  type="time"
                  value={formData.start_time ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Fim</Label>
                <Input
                  type="time"
                  value={formData.end_time ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Textarea
              placeholder="Motivo da ausência (opcional)"
              value={formData.reason ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.professional_id || !formData.start_date || !formData.end_date || isCreating}
            >
              {isCreating ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
