// Interface idêntica ao Leads original
export interface Lead {
  id: string;
  responsavel: string;
  nome: string;
  contato: string;
  origem: string;
  procedimento: string;
  status: string;
  dataEntrada: string;
  dataUltimoContato?: string;
  dataAgendamento?: string;
  dataAvaliacao?: string;
  compareceu?: string;
  dataFechamento?: string;
  valorFechado?: string;
  observacao?: string;
}

// DTO para criação (campos obrigatórios mínimos)
export interface CreateLeadDTO {
  nome: string;
  contato: string;
  responsavel?: string;
  origem?: string;
}

// DTO para edição (todos opcionais exceto id)
export interface UpdateLeadDTO extends Partial<Lead> {
  id: string;
}
