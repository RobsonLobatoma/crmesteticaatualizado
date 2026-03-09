// Interface para Tags personalizadas de leads
export interface LeadTag {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}

// Interface idêntica ao Leads original
export interface Lead {
  id: string;
  responsavel: string;
  nome: string;
  contato: string;
  email?: string;
  origem: string;
  procedimento: string;
  status: string;
  dataEntrada: string;
  dataUltimoContato?: string;
  dataAgendamento?: string;
  dataAvaliacao?: string;
  dataProcedimento?: string;
  compareceu?: string;
  dataFechamento?: string;
  valorFechado?: string;
  observacao?: string;
  // Novos campos de endereço
  dataNascimento?: string;
  cpf?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  // Campo de tags
  tags?: string[];
}

// DTO para criação (campos obrigatórios mínimos + opcionais)
export interface CreateLeadDTO {
  nome: string;
  contato: string;
  responsavel?: string;
  origem?: string;
  procedimento?: string;
  status?: string;
  dataEntrada?: string;
  dataUltimoContato?: string;
  dataAgendamento?: string;
  dataAvaliacao?: string;
  dataProcedimento?: string;
  compareceu?: string;
  dataFechamento?: string;
  valorFechado?: string;
  observacao?: string;
  // Campos de endereço
  dataNascimento?: string;
  cpf?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  // Tags
  tags?: string[];
}

// DTO para edição (todos opcionais exceto id)
export interface UpdateLeadDTO extends Partial<Lead> {
  id: string;
}
