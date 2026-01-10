export interface ProtocoloAtendimento {
  id?: string;
  etapa: string;
  objetivo: string;
  script: string;
}

export interface PerguntaSondagem {
  id?: string;
  categoria: string;
  pergunta: string;
  objetivo: string;
}

export interface FechamentoAcao {
  id?: string;
  acao: string;
  script: string;
  observacao: string;
}

export interface Objecao {
  id?: string;
  categoria: string;
  objecaoComum: string;
  estrategia: string;
  scriptExemplo: string;
}

export interface Depoimento {
  id?: string;
  objecao: string;
  depoimento: string;
}

export type PlaybookCategory = 'protocolo' | 'sondagem' | 'fechamento' | 'objecoes' | 'depoimentos';

export interface PlaybookMessage {
  id: string;
  user_id: string;
  category: PlaybookCategory;
  etapa?: string;
  objetivo?: string;
  script?: string;
  categoria?: string;
  pergunta?: string;
  acao?: string;
  observacao?: string;
  objecao_comum?: string;
  estrategia?: string;
  script_exemplo?: string;
  objecao?: string;
  depoimento?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
