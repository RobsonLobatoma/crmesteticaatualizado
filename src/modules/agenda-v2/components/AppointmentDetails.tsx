import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2, DollarSign, MessageCircle, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AppointmentWithRelations } from "../types";

interface AppointmentDetailsProps {
  appointment: AppointmentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  onWhatsApp: () => void;
  onCreateSale: () => void;
}

const STATUS_OPTIONS = [
  { value: "agendado", label: "Agendado", color: "bg-blue-500" },
  { value: "confirmado", label: "Confirmado", color: "bg-green-500" },
  { value: "em_atendimento", label: "Em atendimento", color: "bg-yellow-500" },
  { value: "concluido", label: "Concluído", color: "bg-gray-500" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-500" },
  { value: "no_show", label: "No-show", color: "bg-orange-500" },
];

export function AppointmentDetails({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
  onWhatsApp,
  onCreateSale,
}: AppointmentDetailsProps) {
  if (!appointment) return null;

  const startDate = parseISO(appointment.start_datetime);
  const status = STATUS_OPTIONS.find((s) => s.value === appointment.status) ?? STATUS_OPTIONS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{appointment.client?.name ?? "Cliente"}</p>
              <p className="text-sm text-muted-foreground">{appointment.client?.phone ?? "-"}</p>
            </div>
          </div>

          <Separator />

          {/* Appointment Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-medium">{format(startDate, "d 'de' MMMM, yyyy", { locale: ptBR })}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Horário</p>
              <p className="font-medium">{format(startDate, "HH:mm")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duração</p>
              <p className="font-medium">{appointment.duration_minutes} min</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profissional</p>
              <p className="font-medium">{appointment.professional?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Serviço</p>
              <p className="font-medium">{appointment.service?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sala</p>
              <p className="font-medium">{appointment.room?.name ?? "-"}</p>
            </div>
          </div>

          {appointment.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Status Dropdown */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Status</p>
            <Select value={appointment.status ?? "agendado"} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${status.color}`} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" onClick={onWhatsApp}>
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button variant="outline" onClick={onCreateSale}>
              <DollarSign className="mr-2 h-4 w-4" />
              Criar Venda
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
