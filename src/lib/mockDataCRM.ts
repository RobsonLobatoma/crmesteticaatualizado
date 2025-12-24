import { ClientePotencial, Mensagem, EventoHistorico, StatusLead } from '@/types/crm';

export const mockClientes: ClientePotencial[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    telefone: '(11) 98765-4321',
    email: 'maria.silva@email.com',
    status: 'novo',
    responsavel: 'Ana Paula',
    origem: 'WhatsApp',
    ultimaMensagem: 'Olá! Gostaria de saber mais sobre o preenchimento labial',
    horarioUltimaMensagem: '14:32',
    dataCriacao: '2025-12-19T10:00:00',
    ultimaInteracao: '2025-12-19T14:32:00',
    tags: ['VIP', 'Preenchimento', 'Primeira vez'],
    observacoes: 'Cliente demonstrou muito interesse. Mencionou que viu resultados de uma amiga e gostaria de agendar uma avaliação.',
    totalMensagens: 3,
    mensagensNaoLidas: 2,
    urgente: true
  },
  {
    id: '2',
    nome: 'João Santos',
    telefone: '(11) 97654-3210',
    email: 'joao.santos@email.com',
    status: 'qualificacao',
    responsavel: 'Carlos Eduardo',
    origem: 'Instagram',
    ultimaMensagem: 'Qual é o valor do procedimento de harmonização?',
    horarioUltimaMensagem: '13:15',
    dataCriacao: '2025-12-18T15:20:00',
    ultimaInteracao: '2025-12-19T13:15:00',
    tags: ['Harmonização', 'Orçamento'],
    observacoes: 'Cliente já fez toxina em outro local. Quer mudar de clínica por insatisfação com o atendimento anterior.',
    totalMensagens: 8,
    mensagensNaoLidas: 0,
    urgente: false
  },
  {
    id: '3',
    nome: 'Ana Paula Oliveira',
    telefone: '(11) 96543-2109',
    status: 'aguardando',
    responsavel: 'Beatriz Lima',
    origem: 'TikTok',
    ultimaMensagem: 'Estou aguardando retorno sobre a disponibilidade...',
    horarioUltimaMensagem: '11:45',
    dataCriacao: '2025-12-18T09:30:00',
    ultimaInteracao: '2025-12-19T11:45:00',
    tags: ['Retorno', 'Agendamento'],
    observacoes: 'Cliente quer agendar para a próxima semana. Aguardando confirmação de horários disponíveis.',
    totalMensagens: 5,
    mensagensNaoLidas: 1,
    urgente: true
  },
  {
    id: '4',
    nome: 'Carlos Eduardo Mendes',
    telefone: '(21) 95432-1098',
    email: 'carlos.mendes@email.com',
    status: 'atendimento',
    responsavel: 'Ana Paula',
    origem: 'Anúncio',
    ultimaMensagem: 'Perfeito! Pode agendar para quinta-feira às 15h?',
    horarioUltimaMensagem: '10:22',
    dataCriacao: '2025-12-17T14:00:00',
    ultimaInteracao: '2025-12-19T10:22:00',
    tags: ['Toxina', 'Agendado'],
    observacoes: 'Procedimento de toxina botulínica agendado para quinta-feira. Cliente está muito animado.',
    totalMensagens: 12,
    mensagensNaoLidas: 0,
    urgente: false
  },
  {
    id: '5',
    nome: 'Beatriz Lima Costa',
    telefone: '(21) 94321-0987',
    status: 'atendimento',
    responsavel: 'Carlos Eduardo',
    origem: 'Indicação',
    ultimaMensagem: 'Vou verificar minha agenda e confirmo ainda hoje',
    horarioUltimaMensagem: '09:55',
    dataCriacao: '2025-12-16T11:20:00',
    ultimaInteracao: '2025-12-19T09:55:00',
    tags: ['Indicação', 'Preenchimento'],
    observacoes: 'Indicação da cliente Maria Silva. Interessada em preenchimento e harmonização completa.',
    totalMensagens: 10,
    mensagensNaoLidas: 0,
    urgente: false
  },
  {
    id: '6',
    nome: 'Rafael Costa Silva',
    telefone: '(11) 93210-9876',
    email: 'rafael.costa@email.com',
    status: 'finalizado',
    responsavel: 'Ana Paula',
    origem: 'WhatsApp',
    ultimaMensagem: 'Muito obrigado pelo atendimento! Procedimento agendado ✅',
    horarioUltimaMensagem: '08:30',
    dataCriacao: '2025-12-15T10:00:00',
    ultimaInteracao: '2025-12-19T08:30:00',
    tags: ['Finalizado', 'Harmonização'],
    observacoes: 'Procedimento de harmonização facial completo agendado com sucesso. Cliente muito satisfeito.',
    totalMensagens: 15,
    mensagensNaoLidas: 0,
    urgente: false
  },
  {
    id: '7',
    nome: 'Juliana Ferreira Santos',
    telefone: '(21) 92109-8765',
    status: 'perdido',
    responsavel: 'Beatriz Lima',
    origem: 'Instagram',
    ultimaMensagem: 'Achei muito caro, vou pensar melhor...',
    horarioUltimaMensagem: '16:40',
    dataCriacao: '2025-12-14T13:00:00',
    ultimaInteracao: '2025-12-18T16:40:00',
    tags: ['Preço', 'Perdido'],
    observacoes: 'Cliente desistiu devido ao valor. Mencionou que encontrou opção mais barata.',
    totalMensagens: 6,
    mensagensNaoLidas: 0,
    urgente: false
  },
  {
    id: '8',
    nome: 'Pedro Henrique Alves',
    telefone: '(11) 91098-7654',
    status: 'voltar',
    responsavel: 'Carlos Eduardo',
    origem: 'Promoção',
    ultimaMensagem: 'Pode me mandar mais informações sobre os procedimentos?',
    horarioUltimaMensagem: '15:10',
    dataCriacao: '2025-12-17T16:30:00',
    ultimaInteracao: '2025-12-18T15:10:00',
    tags: ['Promoção', 'Informações'],
    observacoes: 'Cliente parou de responder após pedir mais informações. Voltar contato em 24h.',
    totalMensagens: 4,
    mensagensNaoLidas: 1,
    urgente: false
  },
  {
    id: '9',
    nome: 'Fernanda Alves Rodrigues',
    telefone: '(21) 90987-6543',
    email: 'fernanda.alves@email.com',
    status: 'novo',
    responsavel: 'Ana Paula',
    origem: 'Instagram',
    ultimaMensagem: 'Vi o anúncio no Instagram e me interessei pelos procedimentos',
    horarioUltimaMensagem: '17:25',
    dataCriacao: '2025-12-19T17:20:00',
    ultimaInteracao: '2025-12-19T17:25:00',
    tags: ['Instagram', 'Interessada'],
    observacoes: 'Lead novo, demonstrou interesse imediato. Responder com informações completas.',
    totalMensagens: 2,
    mensagensNaoLidas: 1,
    urgente: false
  },
  {
    id: '10',
    nome: 'Lucas Martins Souza',
    telefone: '(11) 89876-5432',
    status: 'qualificacao',
    responsavel: 'Beatriz Lima',
    origem: 'WhatsApp',
    ultimaMensagem: 'Quais são os procedimentos disponíveis e os valores?',
    horarioUltimaMensagem: '12:50',
    dataCriacao: '2025-12-18T18:00:00',
    ultimaInteracao: '2025-12-19T12:50:00',
    tags: ['Consulta', 'Valores'],
    observacoes: 'Cliente está pesquisando. Demonstrou interesse em conhecer todas as opções disponíveis.',
    totalMensagens: 7,
    mensagensNaoLidas: 0,
    urgente: false
  },
];

export const mockMensagens: Record<string, Mensagem[]> = {
  '1': [
    {
      id: 'm1-1',
      clienteId: '1',
      remetente: 'cliente',
      nomeRemetente: 'Maria Silva',
      texto: 'Oi! Tudo bem?',
      horario: '14:28',
      data: '2025-12-19T14:28:00',
      lida: true
    },
    {
      id: 'm1-2',
      clienteId: '1',
      remetente: 'atendente',
      nomeRemetente: 'Ana Paula',
      texto: 'Olá Maria! Tudo ótimo! Como posso te ajudar hoje?',
      horario: '14:29',
      data: '2025-12-19T14:29:00',
      lida: true
    },
    {
      id: 'm1-3',
      clienteId: '1',
      remetente: 'cliente',
      nomeRemetente: 'Maria Silva',
      texto: 'Gostaria de saber mais sobre o preenchimento labial. Uma amiga fez e ficou lindo!',
      horario: '14:32',
      data: '2025-12-19T14:32:00',
      lida: false
    }
  ],
  '2': [
    {
      id: 'm2-1',
      clienteId: '2',
      remetente: 'cliente',
      nomeRemetente: 'João Santos',
      texto: 'Bom dia! Vi o perfil de vocês no Instagram',
      horario: '09:15',
      data: '2025-12-19T09:15:00',
      lida: true
    },
    {
      id: 'm2-2',
      clienteId: '2',
      remetente: 'atendente',
      nomeRemetente: 'Carlos Eduardo',
      texto: 'Bom dia João! Que legal! Como podemos te ajudar?',
      horario: '09:17',
      data: '2025-12-19T09:17:00',
      lida: true
    },
    {
      id: 'm2-3',
      clienteId: '2',
      remetente: 'cliente',
      nomeRemetente: 'João Santos',
      texto: 'Tenho interesse em harmonização facial. Já fiz toxina em outro lugar mas não gostei muito do atendimento.',
      horario: '09:20',
      data: '2025-12-19T09:20:00',
      lida: true
    },
    {
      id: 'm2-4',
      clienteId: '2',
      remetente: 'atendente',
      nomeRemetente: 'Carlos Eduardo',
      texto: 'Entendo! Aqui trabalhamos com harmonização completa. O procedimento inclui avaliação facial detalhada e planejamento personalizado.',
      horario: '09:22',
      data: '2025-12-19T09:22:00',
      lida: true
    },
    {
      id: 'm2-5',
      clienteId: '2',
      remetente: 'cliente',
      nomeRemetente: 'João Santos',
      texto: 'Qual é o valor do procedimento de harmonização?',
      horario: '13:15',
      data: '2025-12-19T13:15:00',
      lida: true
    }
  ],
  '3': [
    {
      id: 'm3-1',
      clienteId: '3',
      remetente: 'cliente',
      nomeRemetente: 'Ana Paula Oliveira',
      texto: 'Oi! Vi um vídeo de vocês no TikTok e adorei!',
      horario: '10:30',
      data: '2025-12-19T10:30:00',
      lida: true
    },
    {
      id: 'm3-2',
      clienteId: '3',
      remetente: 'atendente',
      nomeRemetente: 'Beatriz Lima',
      texto: 'Que ótimo Ana Paula! Ficamos muito felizes! Qual procedimento te interessou?',
      horario: '10:35',
      data: '2025-12-19T10:35:00',
      lida: true
    },
    {
      id: 'm3-3',
      clienteId: '3',
      remetente: 'cliente',
      nomeRemetente: 'Ana Paula Oliveira',
      texto: 'Gostaria de fazer preenchimento. Vocês têm horário disponível na próxima semana?',
      horario: '10:40',
      data: '2025-12-19T10:40:00',
      lida: true
    },
    {
      id: 'm3-4',
      clienteId: '3',
      remetente: 'atendente',
      nomeRemetente: 'Beatriz Lima',
      texto: 'Vou verificar os horários disponíveis e já te retorno, ok?',
      horario: '10:42',
      data: '2025-12-19T10:42:00',
      lida: true
    },
    {
      id: 'm3-5',
      clienteId: '3',
      remetente: 'cliente',
      nomeRemetente: 'Ana Paula Oliveira',
      texto: 'Estou aguardando retorno sobre a disponibilidade...',
      horario: '11:45',
      data: '2025-12-19T11:45:00',
      lida: false
    }
  ],
  '4': [
    {
      id: 'm4-1',
      clienteId: '4',
      remetente: 'cliente',
      nomeRemetente: 'Carlos Eduardo Mendes',
      texto: 'Bom dia! Vi o anúncio de vocês e gostaria de informações sobre toxina botulínica.',
      horario: '08:15',
      data: '2025-12-19T08:15:00',
      lida: true
    },
    {
      id: 'm4-2',
      clienteId: '4',
      remetente: 'atendente',
      nomeRemetente: 'Ana Paula',
      texto: 'Bom dia Carlos! Trabalhamos com toxina de altíssima qualidade. Qual região você tem interesse?',
      horario: '08:20',
      data: '2025-12-19T08:20:00',
      lida: true
    },
    {
      id: 'm4-3',
      clienteId: '4',
      remetente: 'cliente',
      nomeRemetente: 'Carlos Eduardo Mendes',
      texto: 'Principalmente na testa e ao redor dos olhos.',
      horario: '08:25',
      data: '2025-12-19T08:25:00',
      lida: true
    },
    {
      id: 'm4-4',
      clienteId: '4',
      remetente: 'atendente',
      nomeRemetente: 'Ana Paula',
      texto: 'Perfeito! Essas são as regiões mais comuns. O procedimento é rápido e os resultados aparecem em poucos dias. Vou te passar os valores e horários disponíveis.',
      horario: '08:27',
      data: '2025-12-19T08:27:00',
      lida: true
    },
    {
      id: 'm4-5',
      clienteId: '4',
      remetente: 'cliente',
      nomeRemetente: 'Carlos Eduardo Mendes',
      texto: 'Perfeito! Pode agendar para quinta-feira às 15h?',
      horario: '10:22',
      data: '2025-12-19T10:22:00',
      lida: true
    }
  ],
  '5': [
    {
      id: 'm5-1',
      clienteId: '5',
      remetente: 'cliente',
      nomeRemetente: 'Beatriz Lima Costa',
      texto: 'Oi! A Maria me indicou vocês. Ela fez preenchimento aí e ficou lindo!',
      horario: '09:10',
      data: '2025-12-19T09:10:00',
      lida: true
    },
    {
      id: 'm5-2',
      clienteId: '5',
      remetente: 'atendente',
      nomeRemetente: 'Carlos Eduardo',
      texto: 'Que maravilha Beatriz! A Maria é uma cliente querida! Como podemos te ajudar?',
      horario: '09:12',
      data: '2025-12-19T09:12:00',
      lida: true
    },
    {
      id: 'm5-3',
      clienteId: '5',
      remetente: 'cliente',
      nomeRemetente: 'Beatriz Lima Costa',
      texto: 'Vou verificar minha agenda e confirmo ainda hoje',
      horario: '09:55',
      data: '2025-12-19T09:55:00',
      lida: true
    }
  ],
  '6': [
    {
      id: 'm6-1',
      clienteId: '6',
      remetente: 'cliente',
      nomeRemetente: 'Rafael Costa Silva',
      texto: 'Muito obrigado pelo atendimento! Procedimento agendado ✅',
      horario: '08:30',
      data: '2025-12-19T08:30:00',
      lida: true
    }
  ],
  '7': [
    {
      id: 'm7-1',
      clienteId: '7',
      remetente: 'cliente',
      nomeRemetente: 'Juliana Ferreira Santos',
      texto: 'Achei muito caro, vou pensar melhor...',
      horario: '16:40',
      data: '2025-12-18T16:40:00',
      lida: true
    }
  ],
  '8': [
    {
      id: 'm8-1',
      clienteId: '8',
      remetente: 'cliente',
      nomeRemetente: 'Pedro Henrique Alves',
      texto: 'Pode me mandar mais informações sobre os procedimentos?',
      horario: '15:10',
      data: '2025-12-18T15:10:00',
      lida: false
    }
  ],
  '9': [
    {
      id: 'm9-1',
      clienteId: '9',
      remetente: 'cliente',
      nomeRemetente: 'Fernanda Alves Rodrigues',
      texto: 'Olá!',
      horario: '17:23',
      data: '2025-12-19T17:23:00',
      lida: true
    },
    {
      id: 'm9-2',
      clienteId: '9',
      remetente: 'cliente',
      nomeRemetente: 'Fernanda Alves Rodrigues',
      texto: 'Vi o anúncio no Instagram e me interessei pelos procedimentos',
      horario: '17:25',
      data: '2025-12-19T17:25:00',
      lida: false
    }
  ],
  '10': [
    {
      id: 'm10-1',
      clienteId: '10',
      remetente: 'cliente',
      nomeRemetente: 'Lucas Martins Souza',
      texto: 'Quais são os procedimentos disponíveis e os valores?',
      horario: '12:50',
      data: '2025-12-19T12:50:00',
      lida: true
    }
  ],
};

export const mockHistorico: Record<string, EventoHistorico[]> = {
  '1': [
    {
      id: 'h1-1',
      clienteId: '1',
      tipo: 'lead_criado',
      descricao: 'Lead criado através do WhatsApp',
      usuario: 'Sistema',
      dataHora: '2025-12-19T10:00:00'
    },
    {
      id: 'h1-2',
      clienteId: '1',
      tipo: 'tag_adicionada',
      descricao: 'Tag "VIP" adicionada',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T10:05:00',
      detalhes: { tagAdicionada: 'VIP' }
    },
    {
      id: 'h1-3',
      clienteId: '1',
      tipo: 'mensagem_enviada',
      descricao: 'Primeira mensagem recebida do cliente',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T14:28:00'
    },
    {
      id: 'h1-4',
      clienteId: '1',
      tipo: 'observacao',
      descricao: 'Observação adicionada sobre interesse em preenchimento',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T14:35:00'
    }
  ],
  '2': [
    {
      id: 'h2-1',
      clienteId: '2',
      tipo: 'lead_criado',
      descricao: 'Lead criado através do Instagram',
      usuario: 'Sistema',
      dataHora: '2025-12-18T15:20:00'
    },
    {
      id: 'h2-2',
      clienteId: '2',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em qualificação',
      usuario: 'Carlos Eduardo',
      dataHora: '2025-12-18T15:30:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'qualificacao' }
    },
    {
      id: 'h2-3',
      clienteId: '2',
      tipo: 'mensagem_enviada',
      descricao: 'Mensagem enviada com informações sobre harmonização',
      usuario: 'Carlos Eduardo',
      dataHora: '2025-12-19T09:22:00'
    }
  ],
  '3': [
    {
      id: 'h3-1',
      clienteId: '3',
      tipo: 'lead_criado',
      descricao: 'Lead criado através do TikTok',
      usuario: 'Sistema',
      dataHora: '2025-12-18T09:30:00'
    },
    {
      id: 'h3-2',
      clienteId: '3',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em qualificação',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-18T10:00:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'qualificacao' }
    },
    {
      id: 'h3-3',
      clienteId: '3',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Em qualificação para Aguardando atendente',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-19T10:45:00',
      detalhes: { statusAnterior: 'qualificacao', statusNovo: 'aguardando' }
    },
    {
      id: 'h3-4',
      clienteId: '3',
      tipo: 'tag_adicionada',
      descricao: 'Tag "Retorno" adicionada',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-19T11:00:00',
      detalhes: { tagAdicionada: 'Retorno' }
    }
  ],
  '4': [
    {
      id: 'h4-1',
      clienteId: '4',
      tipo: 'lead_criado',
      descricao: 'Lead criado através de Anúncio',
      usuario: 'Sistema',
      dataHora: '2025-12-17T14:00:00'
    },
    {
      id: 'h4-2',
      clienteId: '4',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em qualificação',
      usuario: 'Ana Paula',
      dataHora: '2025-12-17T14:30:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'qualificacao' }
    },
    {
      id: 'h4-3',
      clienteId: '4',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Em qualificação para Em atendimento',
      usuario: 'Ana Paula',
      dataHora: '2025-12-18T10:00:00',
      detalhes: { statusAnterior: 'qualificacao', statusNovo: 'atendimento' }
    },
    {
      id: 'h4-4',
      clienteId: '4',
      tipo: 'ligacao',
      descricao: 'Ligação realizada para confirmar agendamento',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T09:00:00'
    },
    {
      id: 'h4-5',
      clienteId: '4',
      tipo: 'tag_adicionada',
      descricao: 'Tag "Agendado" adicionada',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T10:25:00',
      detalhes: { tagAdicionada: 'Agendado' }
    }
  ],
  '5': [
    {
      id: 'h5-1',
      clienteId: '5',
      tipo: 'lead_criado',
      descricao: 'Lead criado através de Indicação',
      usuario: 'Sistema',
      dataHora: '2025-12-16T11:20:00'
    },
    {
      id: 'h5-2',
      clienteId: '5',
      tipo: 'tag_adicionada',
      descricao: 'Tag "Indicação" adicionada',
      usuario: 'Carlos Eduardo',
      dataHora: '2025-12-16T11:25:00',
      detalhes: { tagAdicionada: 'Indicação' }
    },
    {
      id: 'h5-3',
      clienteId: '5',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em atendimento',
      usuario: 'Carlos Eduardo',
      dataHora: '2025-12-17T09:00:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'atendimento' }
    }
  ],
  '6': [
    {
      id: 'h6-1',
      clienteId: '6',
      tipo: 'lead_criado',
      descricao: 'Lead criado através do WhatsApp',
      usuario: 'Sistema',
      dataHora: '2025-12-15T10:00:00'
    },
    {
      id: 'h6-2',
      clienteId: '6',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em qualificação',
      usuario: 'Ana Paula',
      dataHora: '2025-12-15T11:00:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'qualificacao' }
    },
    {
      id: 'h6-3',
      clienteId: '6',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Em qualificação para Em atendimento',
      usuario: 'Ana Paula',
      dataHora: '2025-12-16T10:00:00',
      detalhes: { statusAnterior: 'qualificacao', statusNovo: 'atendimento' }
    },
    {
      id: 'h6-4',
      clienteId: '6',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Em atendimento para Finalizado',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T08:35:00',
      detalhes: { statusAnterior: 'atendimento', statusNovo: 'finalizado' }
    },
    {
      id: 'h6-5',
      clienteId: '6',
      tipo: 'finalizado',
      descricao: 'Lead finalizado com sucesso - Procedimento agendado',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T08:35:00'
    }
  ],
  '7': [
    {
      id: 'h7-1',
      clienteId: '7',
      tipo: 'lead_criado',
      descricao: 'Lead criado através do Instagram',
      usuario: 'Sistema',
      dataHora: '2025-12-14T13:00:00'
    },
    {
      id: 'h7-2',
      clienteId: '7',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em qualificação',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-14T14:00:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'qualificacao' }
    },
    {
      id: 'h7-3',
      clienteId: '7',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Em qualificação para Perdido',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-18T17:00:00',
      detalhes: { statusAnterior: 'qualificacao', statusNovo: 'perdido' }
    },
    {
      id: 'h7-4',
      clienteId: '7',
      tipo: 'tag_adicionada',
      descricao: 'Tag "Preço" adicionada',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-18T17:00:00',
      detalhes: { tagAdicionada: 'Preço' }
    }
  ],
  '8': [
    {
      id: 'h8-1',
      clienteId: '8',
      tipo: 'lead_criado',
      descricao: 'Lead criado através de Promoção',
      usuario: 'Sistema',
      dataHora: '2025-12-17T16:30:00'
    },
    {
      id: 'h8-2',
      clienteId: '8',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em qualificação',
      usuario: 'Carlos Eduardo',
      dataHora: '2025-12-17T17:00:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'qualificacao' }
    },
    {
      id: 'h8-3',
      clienteId: '8',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Em qualificação para Voltar contato',
      usuario: 'Carlos Eduardo',
      dataHora: '2025-12-18T15:30:00',
      detalhes: { statusAnterior: 'qualificacao', statusNovo: 'voltar' }
    }
  ],
  '9': [
    {
      id: 'h9-1',
      clienteId: '9',
      tipo: 'lead_criado',
      descricao: 'Lead criado através do Instagram',
      usuario: 'Sistema',
      dataHora: '2025-12-19T17:20:00'
    },
    {
      id: 'h9-2',
      clienteId: '9',
      tipo: 'mensagem_enviada',
      descricao: 'Primeira mensagem recebida do cliente',
      usuario: 'Ana Paula',
      dataHora: '2025-12-19T17:25:00'
    }
  ],
  '10': [
    {
      id: 'h10-1',
      clienteId: '10',
      tipo: 'lead_criado',
      descricao: 'Lead criado através do WhatsApp',
      usuario: 'Sistema',
      dataHora: '2025-12-18T18:00:00'
    },
    {
      id: 'h10-2',
      clienteId: '10',
      tipo: 'status_alterado',
      descricao: 'Status alterado de Novo para Em qualificação',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-18T18:30:00',
      detalhes: { statusAnterior: 'novo', statusNovo: 'qualificacao' }
    },
    {
      id: 'h10-3',
      clienteId: '10',
      tipo: 'tag_adicionada',
      descricao: 'Tag "Consulta" adicionada',
      usuario: 'Beatriz Lima',
      dataHora: '2025-12-19T12:55:00',
      detalhes: { tagAdicionada: 'Consulta' }
    }
  ],
};

// Função para adicionar evento de mudança de status ao histórico
export const adicionarEventoHistorico = (
  clienteId: string,
  statusAnterior: StatusLead,
  statusNovo: StatusLead,
  nomeCliente: string,
  tituloColuna: string
) => {
  const evento: EventoHistorico = {
    id: `h-${Date.now()}-${Math.random()}`,
    clienteId,
    tipo: 'status_alterado',
    descricao: `Status alterado de "${obterTituloStatus(statusAnterior)}" para "${tituloColuna}"`,
    usuario: 'Você',
    dataHora: new Date().toISOString(),
    detalhes: {
      statusAnterior,
      statusNovo
    }
  };

  if (!mockHistorico[clienteId]) {
    mockHistorico[clienteId] = [];
  }
  
  // Adiciona no início do array (mais recente primeiro)
  mockHistorico[clienteId].unshift(evento);
};

// Mapeamento de status para títulos legíveis
const obterTituloStatus = (status: StatusLead): string => {
  const titulos: Record<StatusLead, string> = {
    'novo': 'Novo',
    'qualificacao': 'Em qualificação',
    'aguardando': 'Aguardando atendente',
    'atendimento': 'Em atendimento',
    'finalizado': 'Finalizado',
    'perdido': 'Perdido',
    'voltar': 'Voltar contato'
  };
  return titulos[status] || status;
};
