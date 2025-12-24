import {
  ProtocoloAtendimento,
  PerguntaSondagem,
  FechamentoAcao,
  Objecao,
  Depoimento,
} from "../types/Playbook";

export const protocoloData: ProtocoloAtendimento[] = [
  {
    etapa: "Abordagem Inicial",
    objetivo: "Criar conexão e rapport",
    script: "Olá [Nome]! Tudo bem? Vi que você tem interesse em [procedimento]. Eu sou [Seu Nome], da [Clínica], e estou aqui para te ajudar a alcançar os resultados que você busca de forma natural e segura.",
  },
  {
    etapa: "Sondagem Qualificada",
    objetivo: "Entender necessidades e qualificar o lead",
    script: "Me conta um pouco: o que te motivou a buscar esse procedimento agora? Você já pensou nisso há quanto tempo?",
  },
  {
    etapa: "Demonstração de Resultados",
    objetivo: "Mostrar credibilidade e provas sociais",
    script: "Aqui na clínica, já atendemos mais de [X] pacientes com esse mesmo objetivo. Posso te mostrar alguns resultados de pessoas que estavam na mesma situação que você.",
  },
];

export const sondagemData: PerguntaSondagem[] = [
  {
    categoria: "Motivação",
    pergunta: "O que te motivou a buscar esse procedimento agora?",
    objetivo: "Descobrir a dor/desejo principal",
  },
  {
    categoria: "Motivação",
    pergunta: "Há quanto tempo você pensa nisso?",
    objetivo: "Entender urgência e maturidade da decisão",
  },
  {
    categoria: "Expectativa",
    pergunta: "Como você imagina que seria o resultado ideal para você?",
    objetivo: "Alinhar expectativas e educar",
  },
  {
    categoria: "Insatisfações",
    pergunta: "O que mais te incomoda quando você se olha no espelho?",
    objetivo: "Identificar a dor emocional",
  },
  {
    categoria: "Insatisfações",
    pergunta: "Você já tentou resolver isso de outra forma antes?",
    objetivo: "Entender histórico e possíveis objeções",
  },
  {
    categoria: "Análise Visual",
    pergunta: "Você teria alguns minutinhos para uma análise rápida por vídeo/foto?",
    objetivo: "Qualificar tecnicamente e personalizar proposta",
  },
  {
    categoria: "Empatia",
    pergunta: "Eu entendo exatamente como você se sente. Muitas pacientes minhas já passaram por isso e hoje estão muito felizes com os resultados.",
    objetivo: "Criar conexão emocional",
  },
];

export const fechamentoData: FechamentoAcao[] = [
  {
    acao: "Explicar Valor da Consulta",
    script: "A consulta é o momento em que vamos fazer uma avaliação completa e personalizada para você. Vou te mostrar exatamente o que pode ser feito no seu caso e tirar todas as suas dúvidas.",
    observacao: "Reforçar que a consulta é o primeiro passo",
  },
  {
    acao: "Apresentar Investimento",
    script: "O investimento na consulta é de R$ [valor], que já pode ser abatido do procedimento caso você decida seguir com a gente.",
    observacao: "Mostrar que é um investimento, não um gasto",
  },
  {
    acao: "Propor Agendamento/Follow-up",
    script: "Temos disponibilidade na [data/hora]. Essa data funciona para você? Ou prefere que eu te mande algumas opções?",
    observacao: "Assumir a venda e facilitar o próximo passo",
  },
];

export const objecoesData: Objecao[] = [
  {
    categoria: "Financeira",
    objecaoComum: "Está caro / Não tenho dinheiro agora",
    estrategia: "Mostrar valor e facilitar pagamento",
    scriptExemplo: "Eu entendo. A questão é: quanto vale para você se sentir [resultado desejado]? Aqui trabalhamos com parcelamento e condições especiais. Posso te mostrar as opções?",
  },
  {
    categoria: "Medo/Insegurança",
    objecaoComum: "Tenho medo de ficar artificial / de sentir dor",
    estrategia: "Tranquilizar com técnica e resultados naturais",
    scriptExemplo: "Nosso foco aqui é exatamente o oposto: resultados naturais e harmônicos. Usamos técnicas modernas e confortáveis. Posso te mostrar fotos de pacientes que tinham o mesmo receio que você.",
  },
  {
    categoria: "Confiança",
    objecaoComum: "Preciso pesquisar mais / pensar melhor",
    estrategia: "Oferecer informações e manter contato",
    scriptExemplo: "Claro! Faz todo sentido você querer pesquisar. Posso te enviar materiais e depoimentos de pacientes para te ajudar nessa decisão. Quando você acha que teria uma resposta?",
  },
  {
    categoria: "Experiência Negativa",
    objecaoComum: "Já fiz antes e não gostei do resultado",
    estrategia: "Investigar o que aconteceu e diferenciar",
    scriptExemplo: "Sinto muito que você tenha passado por isso. Me conta: o que exatamente não te agradou? Aqui trabalhamos de forma totalmente personalizada e nossa prioridade é a sua segurança e satisfação.",
  },
];

export const depoimentosData: Depoimento[] = [
  {
    objecao: "Medo de Resultado Artificial",
    depoimento: '"Eu tinha muito medo de ficar artificial, mas a Dra. [Nome] entendeu exatamente o que eu queria: algo natural e harmonioso. Hoje me sinto muito mais confiante!" – Mariana, 34 anos',
  },
  {
    objecao: "Medo de Dor/Agulhas",
    depoimento: '"Confesso que estava apavorada com a ideia das agulhas, mas foi muito mais tranquilo do que eu imaginava. A equipe me deixou super à vontade e o resultado valeu muito a pena!" – Cristina, 28 anos',
  },
  {
    objecao: "Objeção de Preço",
    depoimento: '"No começo achei que seria caro, mas quando vi o resultado e o quanto isso mudou minha autoestima, percebi que foi o melhor investimento que já fiz em mim mesma!" – Patrícia, 41 anos',
  },
];
