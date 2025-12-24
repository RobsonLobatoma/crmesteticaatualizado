import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarGrid } from "./components/CalendarGrid";
import { AppointmentForm } from "./components/AppointmentForm";
import { AbsenceModal } from "./components/AbsenceModal";
import { AppointmentDetails } from "./components/AppointmentDetails";
import { EditAppointmentForm } from "./components/EditAppointmentForm";
import { useAppointments } from "./hooks/useAppointments";
import { useProfessionals } from "./hooks/useProfessionals";
import { CalendarView, AppointmentWithRelations, AppointmentFormData } from "./types";
import { toast } from "sonner";

const AgendaV2Page = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("day");
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<{
    date?: Date;
    time?: string;
    professionalId?: string;
  }>({});

  const { appointments, isLoading, createAppointment, updateAppointment, deleteAppointment, isCreating, isUpdating } =
    useAppointments(currentDate, view);
  const { professionals } = useProfessionals();

  const handleSlotClick = (date: Date, time: string, professionalId?: string) => {
    setFormInitialData({ date, time, professionalId });
  };

  const handleAppointmentClick = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const handleFormSubmit = (data: AppointmentFormData) => {
    const endDateTime = new Date(data.start_datetime);
    endDateTime.setMinutes(endDateTime.getMinutes() + data.duration_minutes);

    createAppointment({
      client_id: data.client_id,
      service_id: data.service_id,
      professional_id: data.professional_id,
      room_id: data.room_id ?? null,
      equipment_id: data.equipment_id ?? null,
      start_datetime: data.start_datetime,
      end_datetime: endDateTime.toISOString(),
      duration_minutes: data.duration_minutes,
      notes: data.notes ?? null,
      recurrence_type: data.recurrence_type,
      recurrence_parent_id: null,
      status: data.status,
      send_sms: data.send_sms,
      user_id: "",
    });
  };

  const handleEditSubmit = (data: Parameters<typeof updateAppointment>[0]) => {
    updateAppointment(data, {
      onSuccess: () => {
        setShowEditForm(false);
        setShowDetails(false);
        setSelectedAppointment(null);
      },
    });
  };

  const handleEdit = () => {
    setShowDetails(false);
    setShowEditForm(true);
  };

  const handleStatusChange = (status: string) => {
    if (selectedAppointment) {
      updateAppointment({ id: selectedAppointment.id, status });
      setSelectedAppointment({ ...selectedAppointment, status });
    }
  };

  const handleDelete = () => {
    if (selectedAppointment) {
      deleteAppointment(selectedAppointment.id);
      setShowDetails(false);
      setSelectedAppointment(null);
    }
  };

  const handleWhatsApp = () => {
    if (selectedAppointment?.client?.phone) {
      const phone = selectedAppointment.client.phone.replace(/\D/g, "");
      const message = `Olá ${selectedAppointment.client.name}! Confirmando seu agendamento.`;
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank");
    } else {
      toast.error("Cliente não possui telefone cadastrado");
    }
  };

  const handleCreateSale = () => {
    toast.info("Funcionalidade de venda em desenvolvimento");
  };

  // KPIs
  const scheduledToday = appointments.filter((a) => a.status === "agendado").length;
  const confirmedToday = appointments.filter((a) => a.status === "confirmado").length;
  const totalAppointments = appointments.length;

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <header className="border-b border-border pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Recepção &amp; Agenda</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie agendamentos, profissionais e lista de espera
        </p>
      </header>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{scheduledToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{confirmedToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total do período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalAppointments}</p>
          </CardContent>
        </Card>
      </section>

      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onTodayClick={() => setCurrentDate(new Date())}
        onAbsenceClick={() => setShowAbsenceModal(true)}
      />

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Form Sidebar */}
        <div className="hidden w-80 shrink-0 lg:block">
          <AppointmentForm
            initialDate={formInitialData.date}
            initialTime={formInitialData.time}
            initialProfessionalId={formInitialData.professionalId}
            onSubmit={handleFormSubmit}
            isSubmitting={isCreating}
          />
        </div>

        {/* Calendar Grid */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <CalendarGrid
              currentDate={currentDate}
              view={view}
              appointments={appointments}
              professionals={professionals}
              onAppointmentClick={handleAppointmentClick}
              onSlotClick={handleSlotClick}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AbsenceModal open={showAbsenceModal} onOpenChange={setShowAbsenceModal} />

      <AppointmentDetails
        appointment={selectedAppointment}
        open={showDetails}
        onOpenChange={setShowDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onWhatsApp={handleWhatsApp}
        onCreateSale={handleCreateSale}
      />

      {selectedAppointment && (
        <EditAppointmentForm
          appointment={selectedAppointment}
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSubmit={handleEditSubmit}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
};

export default AgendaV2Page;
