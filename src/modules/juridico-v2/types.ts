export interface LegalTerm {
  id: string;
  name: string;
  version: string;
  startDate: string;
  type: "consentimento" | "contrato" | "politica";
  status: "ativo" | "inativo" | "rascunho";
}

export interface LgpdLogEntry {
  id: string;
  user: string;
  action: string;
  resource: string;
  createdAt: string;
}
