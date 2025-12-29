export type StatusLead = 
  | 'novo' 
  | 'qualificacao' 
  | 'aguardando' 
  | 'atendimento' 
  | 'finalizado' 
  | 'perdido' 
  | 'voltar';

export type OrigemLead = 
  | 'WhatsApp' 
  | 'Instagram' 
  | 'TikTok' 
  | 'Anúncio' 
  | 'Indicação' 
  | 'Promoção';

export interface ClientePotencial {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status: StatusLead | string;
  responsavel?: string;
  origem?: OrigemLead | string;
  ultimaMensagem?: string;
  horarioUltimaMensagem?: string;
  dataCriacao: string;
  ultimaInteracao: string;
  avatar?: string;
  tags?: string[];
  observacoes?: string;
  totalMensagens: number;
  mensagensNaoLidas: number;
  urgente: boolean;
}

export interface Mensagem {
  id: string;
  clienteId: string;
  remetente: 'cliente' | 'atendente';
  nomeRemetente: string;
  texto: string;
  horario: string;
  data: string;
  lida: boolean;
}

export interface EventoHistorico {
  id: string;
  clienteId: string;
  tipo: 'lead_criado' | 'mensagem_enviada' | 'status_alterado' | 
        'ligacao' | 'email' | 'observacao' | 'tag_adicionada' | 'finalizado';
  descricao: string;
  usuario: string;
  dataHora: string;
  detalhes?: {
    statusAnterior?: StatusLead;
    statusNovo?: StatusLead;
    tagAdicionada?: string;
  };
}

export interface ConfiguracaoCRM {
  atendimentoAutomatico: boolean;
  minutosVoltarContato: number;
  notificarNovosLeads: boolean;
  notificarMudancasStatus: boolean;
}

export interface FiltrosKanban {
  busca: string;
  responsavel: string;
  origem: OrigemLead | 'todos';
  apenasUrgentes: boolean;
  apenasNaoLidos: boolean;
}
