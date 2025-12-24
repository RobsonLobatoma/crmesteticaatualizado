import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "../hooks/useClients";
import { useProfessionals } from "../hooks/useProfessionals";
import { useRooms, useEquipments, useServices } from "../hooks/useResources";
import { AppointmentWithRelations, Client } from "../types";

interface EditAppointmentFormProps {
  appointment: AppointmentWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    id: string;
    client_id?: string;
    service_id?: string;
    professional_id?: string;
    room_id?: string | null;
    equipment_id?: string | null;
    start_datetime?: string;
    end_datetime?: string;
    duration_minutes?: number;
    notes?: string | null;
    recurrence_type?: string;
    status?: string;
    send_sms?: boolean;
  }) => void;
  isSubmitting?: boolean;
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1h 30min" },
  { value: "120", label: "2 horas" },
];

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Nunca" },
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
];

const STATUS_OPTIONS = [
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_atendimento", label: "Em atendimento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
  { value: "no_show", label: "No-show" },
];

export function EditAppointmentForm({
  appointment,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditAppointmentFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(appointment.client ?? null);
  const [showClientDialog, setShowClientDialog] = useState(false);

  const { clients, isLoading: loadingClients } = useClients(searchTerm);
  const { professionals } = useProfessionals();
  const { data: rooms } = useRooms();
  const { data: equipments } = useEquipments();
  const { data: services } = useServices();

  const startDateTime = parseISO(appointment.start_datetime);

  const [formData, setFormData] = useState({
    client_id: appointment.client_id ?? "",
    service_id: appointment.service_id ?? "",
    professional_id: appointment.professional_id ?? "",
    room_id: appointment.room_id,
    equipment_id: appointment.equipment_id,
    duration_minutes: appointment.duration_minutes,
    notes: appointment.notes ?? "",
    recurrence_type: appointment.recurrence_type ?? "none",
    status: appointment.status ?? "agendado",
    send_sms: appointment.send_sms ?? false,
  });

  const [date, setDate] = useState(format(startDateTime, "yyyy-MM-dd"));
  const [time, setTime] = useState(format(startDateTime, "HH:mm"));

  useEffect(() => {
    setSelectedClient(appointment.client ?? null);
    setFormData({
      client_id: appointment.client_id ?? "",
      service_id: appointment.service_id ?? "",
      professional_id: appointment.professional_id ?? "",
      room_id: appointment.room_id,
      equipment_id: appointment.equipment_id,
      duration_minutes: appointment.duration_minutes,
      notes: appointment.notes ?? "",
      recurrence_type: appointment.recurrence_type ?? "none",
      status: appointment.status ?? "agendado",
      send_sms: appointment.send_sms ?? false,
    });
    const start = parseISO(appointment.start_datetime);
    setDate(format(start, "yyyy-MM-dd"));
    setTime(format(start, "HH:mm"));
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTimeNew = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTimeNew);
    endDateTime.setMinutes(endDateTime.getMinutes() + formData.duration_minutes);

    onSubmit({
      id: appointment.id,
      client_id: formData.client_id || undefined,
      service_id: formData.service_id || undefined,
      professional_id: formData.professional_id || undefined,
      room_id: formData.room_id ?? null,
      equipment_id: formData.equipment_id ?? null,
      start_datetime: startDateTimeNew.toISOString(),
      end_datetime: endDateTime.toISOString(),
      duration_minutes: formData.duration_minutes,
      notes: formData.notes || null,
      recurrence_type: formData.recurrence_type,
      status: formData.status,
      send_sms: formData.send_sms,
    });
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setFormData((prev) => ({ ...prev, client_id: client.id }));
    setShowClientDialog(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" type="button" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    {selectedClient?.name ?? "Selecionar cliente"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Selecionar Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <ScrollArea className="h-[300px]">
                      {loadingClients ? (
                        <p className="text-center text-sm text-muted-foreground">Carregando...</p>
                      ) : clients.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                      ) : (
                        <div className="space-y-1">
                          {clients.map((client) => (
                            <Button
                              key={client.id}
                              variant="ghost"
                              type="button"
                              className="w-full justify-start"
                              onClick={() => handleSelectClient(client)}
                            >
                              <div className="text-left">
                                <p className="font-medium">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.phone}</p>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, service_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services?.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} {service.price && `- R$ ${service.price}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora *</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duração</Label>
              <Select
                value={formData.duration_minutes.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, duration_minutes: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Professional */}
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
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: prof.color ?? "#3B82F6" }}
                        />
                        {prof.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room */}
            <div className="space-y-2">
              <Label>Sala</Label>
              <Select
                value={formData.room_id ?? "_none"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, room_id: value === "_none" ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhuma</SelectItem>
                  {rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <Label>Equipamento</Label>
              <Select
                value={formData.equipment_id ?? "_none"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, equipment_id: value === "_none" ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhum</SelectItem>
                  {equipments?.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea
                placeholder="Observações sobre o agendamento..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Recurrence */}
            <div className="space-y-2">
              <Label>Repetir?</Label>
              <Select
                value={formData.recurrence_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, recurrence_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Send SMS */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="edit-send-sms">Enviar SMS de confirmação</Label>
              <Switch
                id="edit-send-sms"
                checked={formData.send_sms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, send_sms: checked }))}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!formData.client_id || !formData.service_id || !formData.professional_id || isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
