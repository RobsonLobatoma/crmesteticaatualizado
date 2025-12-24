import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "../hooks/useClients";
import { useProfessionals } from "../hooks/useProfessionals";
import { useRooms, useEquipments, useServices } from "../hooks/useResources";
import { AppointmentFormData, Client } from "../types";
import { QuickClientForm } from "./QuickClientForm";

interface AppointmentFormProps {
  initialDate?: Date;
  initialTime?: string;
  initialProfessionalId?: string;
  onSubmit: (data: AppointmentFormData) => void;
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
];

export function AppointmentForm({
  initialDate,
  initialTime,
  initialProfessionalId,
  onSubmit,
  isSubmitting,
}: AppointmentFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);

  const { clients, isLoading: loadingClients } = useClients(searchTerm);
  const { professionals } = useProfessionals();
  const { data: rooms } = useRooms();
  const { data: equipments } = useEquipments();
  const { data: services } = useServices();

  const [formData, setFormData] = useState<AppointmentFormData>({
    client_id: "",
    service_id: "",
    professional_id: initialProfessionalId ?? "",
    room_id: undefined,
    equipment_id: undefined,
    start_datetime: "",
    duration_minutes: 60,
    notes: "",
    recurrence_type: "none",
    status: "agendado",
    send_sms: false,
  });

  const [date, setDate] = useState(initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(initialTime ?? "09:00");

  useEffect(() => {
    if (initialDate) setDate(format(initialDate, "yyyy-MM-dd"));
    if (initialTime) setTime(initialTime);
    if (initialProfessionalId) setFormData((prev) => ({ ...prev, professional_id: initialProfessionalId }));
  }, [initialDate, initialTime, initialProfessionalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(`${date}T${time}:00`);
    onSubmit({
      ...formData,
      start_datetime: startDateTime.toISOString(),
    });
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setFormData((prev) => ({ ...prev, client_id: client.id }));
    setShowClientDialog(false);
    setSearchTerm("");
  };

  const handleQuickClientCreated = (client: Client) => {
    setSelectedClient(client);
    setFormData((prev) => ({ ...prev, client_id: client.id }));
    setShowQuickClientForm(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Novo Agendamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-280px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <div className="flex gap-2">
                <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button" className="flex-1 justify-start">
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowQuickClientForm(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Client Info (readonly) */}
            {selectedClient && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">CPF</Label>
                  <Input value={selectedClient.cpf ?? "-"} disabled className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nascimento</Label>
                  <Input value={selectedClient.birth_date ?? "-"} disabled className="h-8 text-sm" />
                </div>
              </div>
            )}

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
                value={formData.room_id ?? ""}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, room_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
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
                value={formData.equipment_id ?? ""}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, equipment_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
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
                value={formData.notes ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Recurrence */}
            <div className="space-y-2">
              <Label>Repetir?</Label>
              <Select
                value={formData.recurrence_type}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, recurrence_type: value }))}
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
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
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
              <Label htmlFor="send-sms">Enviar SMS de confirmação</Label>
              <Switch
                id="send-sms"
                checked={formData.send_sms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, send_sms: checked }))}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={!formData.client_id || !formData.service_id || !formData.professional_id || isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Agendamento"}
            </Button>
          </form>
        </ScrollArea>

        {/* Quick Client Form Dialog */}
        <Dialog open={showQuickClientForm} onOpenChange={setShowQuickClientForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
            </DialogHeader>
            <QuickClientForm
              onSuccess={handleQuickClientCreated}
              onCancel={() => setShowQuickClientForm(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
