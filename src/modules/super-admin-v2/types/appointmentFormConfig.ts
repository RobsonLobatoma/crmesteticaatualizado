export interface AppointmentFormFieldConfig {
  id: string;
  label: string;
  visible: boolean;
  required: boolean;
  order: number;
  defaultValue?: string;
}

export interface AppointmentFormConfig {
  fields: AppointmentFormFieldConfig[];
}

export const DEFAULT_FORM_CONFIG: AppointmentFormConfig = {
  fields: [
    { id: "client", label: "Cliente", visible: true, required: true, order: 1 },
    { id: "service", label: "Serviço", visible: true, required: true, order: 2 },
    { id: "date", label: "Data", visible: true, required: true, order: 3 },
    { id: "time", label: "Hora", visible: true, required: true, order: 4 },
    { id: "duration", label: "Duração", visible: true, required: false, order: 5 },
    { id: "professional", label: "Profissional", visible: true, required: true, order: 6 },
    { id: "room", label: "Sala", visible: true, required: false, order: 7 },
    { id: "equipment", label: "Equipamento", visible: true, required: false, order: 8 },
    { id: "notes", label: "Observação", visible: true, required: false, order: 9 },
    { id: "recurrence", label: "Repetir", visible: true, required: false, order: 10 },
    { id: "status", label: "Status", visible: true, required: false, order: 11 },
  ],
};

export const FIELD_DESCRIPTIONS: Record<string, string> = {
  client: "Seleção do cliente para o agendamento",
  service: "Tipo de serviço a ser realizado",
  date: "Data do agendamento",
  time: "Horário de início",
  duration: "Duração do atendimento",
  professional: "Profissional responsável",
  room: "Sala onde será realizado",
  equipment: "Equipamento necessário",
  notes: "Observações adicionais",
  recurrence: "Configuração de repetição",
  status: "Status do agendamento",
};
