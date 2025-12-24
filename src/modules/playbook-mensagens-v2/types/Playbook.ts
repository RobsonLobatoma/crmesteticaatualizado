export interface ProtocoloAtendimento {
  etapa: string;
  objetivo: string;
  script: string;
}

export interface PerguntaSondagem {
  categoria: string;
  pergunta: string;
  objetivo: string;
}

export interface FechamentoAcao {
  acao: string;
  script: string;
  observacao: string;
}

export interface Objecao {
  categoria: string;
  objecaoComum: string;
  estrategia: string;
  scriptExemplo: string;
}

export interface Depoimento {
  objecao: string;
  depoimento: string;
}
