import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GuiaRapidoV2Page = () => {
  return (
    <main className="flex w-full flex-1 flex-col gap-4 px-3 pt-3 lg:px-6">
      <Card className="bg-background/90 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Guia Rápido — Como registrar sem travar o atendimento
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Passo a passo operacional para registrar leads e avaliações de forma simples e
            consistente.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-[12px] leading-relaxed">
          <section>
            <h2 className="text-[12px] font-semibold">
              1) Regra do registro (sempre)
            </h2>
            <p>
              Todo lead novo entra na base <strong>LEADS_CRM</strong> no mesmo dia. Sem
              registro = não existiu.
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">
              2) Regra do tempo (WhatsApp lotado)
            </h2>
            <p>
              Você não precisa organizar tudo na hora. Sua prioridade é
              <strong> capturar o lead uma vez</strong> e atualizar as informações
              <strong> 2x ao dia</strong>: por volta de <strong>11:30</strong> e
              <strong> 17:30</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">
              3) O que preencher ao receber LEAD NOVO
            </h2>
            <p>
              Preencha sempre: <strong>Canal</strong>, <strong>Responsável</strong>,
              <strong> Nome</strong>, <strong>Contato</strong>, <strong>Origem</strong>,
              <strong> Interesse</strong>, <strong>Status</strong>,
              <strong> Data Entrada (hoje)</strong> e
              <strong> Data Último Contato (hoje)</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">
              4) Quando agendar no Simples Agenda
            </h2>
            <p>
              Ao marcar uma avaliação, preencha a <strong>Data Agendamento (hoje)</strong> e a
              <strong> Data Avaliação</strong> (dia marcado).
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">5) No dia da avaliação</h2>
            <p>
              Registre se o lead <strong>compareceu (Sim/Não)</strong>. Se fechou, preencha
              também a <strong>Data Fechamento</strong> e o <strong>Valor Fechado</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">
              6) Indicadores que saem automaticamente
            </h2>
            <p>
              A partir dos registros, o sistema calcula automaticamente: leads novos,
              conversados, follow-ups, agendamentos, avaliações marcadas, comparecimento, show
              rate, fechamentos e faturamento (R$).
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">7) Capacidade (5 avaliações/dia)</h2>
            <p>
              Com show rate em torno de <strong>70%</strong>, você precisa marcar cerca de
              <strong> 7 avaliações/dia</strong> para realizar <strong>5</strong> (cálculo:
              5 ÷ 0,70 ≈ 7).
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">
              8) Sugestão de etiquetas no WhatsApp Business
            </h2>
            <p>Use etiquetas para organizar rapidamente os contatos:</p>
            <p>
              <strong>
                Novo Hoje; Em triagem; Qualificado; Agendado; Confirmado; Proposta; Fechou; Sem
                perfil; Reativar.
              </strong>
            </p>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold">
              9) Veja seus números no DASH_DIARIO e DASH_MENSAL
            </h2>
            <p>
              Acompanhe seus resultados diretamente nas abas
              <strong> DASH_DIARIO</strong> e <strong>DASH_MENSAL</strong>, sem precisar
              recalcular nada manualmente.
            </p>

            <div className="mt-2 space-y-1">
              <h3 className="text-[12px] font-semibold">Definições rápidas</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Lead novo no dia</strong> = Data Entrada (coluna J) no dia.
                </li>
                <li>
                  <strong>Conversado no dia</strong> = Data Último Contato (coluna K) no dia.
                </li>
                <li>
                  <strong>Follow-up no dia</strong> = Conversado no dia com Data Entrada menor que o
                  dia.
                </li>
                <li>
                  <strong>Agendado no dia</strong> = Data Agendamento (coluna L) no dia.
                </li>
                <li>
                  <strong>Avaliação marcada para o dia</strong> = Data Avaliação (coluna M) no dia.
                </li>
                <li>
                  <strong>Compareceu no dia</strong> = Data Avaliação no dia e Compareceu = Sim.
                </li>
                <li>
                  <strong>Fechamento no dia</strong> = Data Fechamento (coluna O) no dia.
                </li>
              </ul>
            </div>

            <div className="mt-3 space-y-1">
              <h3 className="text-[12px] font-semibold">Listas (para validação)</h3>
              <p className="font-semibold">Canais:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>WhatsApp</li>
                <li>Instagram</li>
                <li>TikTok</li>
              </ul>
            </div>
          </section>
        </CardContent>
      </Card>
    </main>
  );
};

export default GuiaRapidoV2Page;

