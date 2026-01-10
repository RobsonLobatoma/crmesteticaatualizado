import { usePlaybookMessages } from "./hooks/usePlaybookMessages";
import { PlaybookSection } from "./components/PlaybookSection";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlaybookCategory } from "./types/Playbook";

const PlaybookMensagensV2Page = () => {
  const {
    isLoading,
    getProtocoloData,
    getSondagemData,
    getFechamentoData,
    getObjecoesData,
    getDepoimentosData,
    getByCategory,
    create,
    update,
    delete: deleteMessage,
    isCreating,
    isUpdating,
  } = usePlaybookMessages();

  const hasUserProtocolo = getByCategory("protocolo").length > 0;
  const hasUserSondagem = getByCategory("sondagem").length > 0;
  const hasUserFechamento = getByCategory("fechamento").length > 0;
  const hasUserObjecoes = getByCategory("objecoes").length > 0;
  const hasUserDepoimentos = getByCategory("depoimentos").length > 0;

  const handleAdd = (category: PlaybookCategory, data: Record<string, string>) => {
    const categoryData: Record<string, unknown> = { category };

    switch (category) {
      case "protocolo":
        categoryData.etapa = data.etapa;
        categoryData.objetivo = data.objetivo;
        categoryData.script = data.script;
        break;
      case "sondagem":
        categoryData.categoria = data.categoria;
        categoryData.pergunta = data.pergunta;
        categoryData.objetivo = data.objetivo;
        break;
      case "fechamento":
        categoryData.acao = data.acao;
        categoryData.script = data.script;
        categoryData.observacao = data.observacao;
        break;
      case "objecoes":
        categoryData.categoria = data.categoria;
        categoryData.objecao_comum = data.objecaoComum;
        categoryData.estrategia = data.estrategia;
        categoryData.script_exemplo = data.scriptExemplo;
        break;
      case "depoimentos":
        categoryData.objecao = data.objecao;
        categoryData.depoimento = data.depoimento;
        break;
    }

    create(categoryData as Parameters<typeof create>[0]);
  };

  const handleEdit = (category: PlaybookCategory, id: string, data: Record<string, string>) => {
    const updateData: Record<string, unknown> = { id };

    switch (category) {
      case "protocolo":
        updateData.etapa = data.etapa;
        updateData.objetivo = data.objetivo;
        updateData.script = data.script;
        break;
      case "sondagem":
        updateData.categoria = data.categoria;
        updateData.pergunta = data.pergunta;
        updateData.objetivo = data.objetivo;
        break;
      case "fechamento":
        updateData.acao = data.acao;
        updateData.script = data.script;
        updateData.observacao = data.observacao;
        break;
      case "objecoes":
        updateData.categoria = data.categoria;
        updateData.objecao_comum = data.objecaoComum;
        updateData.estrategia = data.estrategia;
        updateData.script_exemplo = data.scriptExemplo;
        break;
      case "depoimentos":
        updateData.objecao = data.objecao;
        updateData.depoimento = data.depoimento;
        break;
    }

    update(updateData as Parameters<typeof update>[0]);
  };

  if (isLoading) {
    return (
      <main className="flex-1 px-4 pt-6 lg:px-8">
        <section className="mx-auto max-w-6xl space-y-6 pb-8">
          <header>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </header>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 pt-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6 pb-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Play book de Mensagens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guia estratégico de atendimento para qualificar leads e fechar consultas
          </p>
        </header>

        {/* Painel 1: Protocolo de Atendimento */}
        <PlaybookSection
          title="1. Protocolo de Atendimento: Construindo Conexão e Confiança"
          columns={[
            { key: "etapa", label: "Etapa", width: "w-[180px]" },
            { key: "objetivo", label: "Objetivo", width: "w-[200px]" },
            { key: "script", label: "Script/Ação Chave", copyable: true },
          ]}
          data={getProtocoloData()}
          category="protocolo"
          hasUserData={hasUserProtocolo}
          onAdd={(data) => handleAdd("protocolo", data)}
          onEdit={(id, data) => handleEdit("protocolo", id, data)}
          onDelete={deleteMessage}
          isLoading={isCreating || isUpdating}
        />

        {/* Painel 2: A Arte da Sondagem */}
        <PlaybookSection
          title="2. A Arte da Sondagem: Perguntas que Qualificam"
          description="Utilize estas perguntas para preencher os campos de qualificação do seu CRM"
          columns={[
            { key: "categoria", label: "Categoria", width: "w-[150px]" },
            { key: "pergunta", label: "Pergunta/Frase Chave", width: "w-[280px]", copyable: true },
            { key: "objetivo", label: "Objetivo no CRM" },
          ]}
          data={getSondagemData()}
          category="sondagem"
          hasUserData={hasUserSondagem}
          onAdd={(data) => handleAdd("sondagem", data)}
          onEdit={(id, data) => handleEdit("sondagem", id, data)}
          onDelete={deleteMessage}
          isLoading={isCreating || isUpdating}
        />

        {/* Painel 3: Fechamento Eficaz */}
        <PlaybookSection
          title="3. Fechamento Eficaz: Da Consulta ao Agendamento"
          columns={[
            { key: "acao", label: "Ação", width: "w-[200px]" },
            { key: "script", label: "Script/Frase Chave", width: "w-[300px]", copyable: true },
            { key: "observacao", label: "Observação para o CRM" },
          ]}
          data={getFechamentoData()}
          category="fechamento"
          hasUserData={hasUserFechamento}
          onAdd={(data) => handleAdd("fechamento", data)}
          onEdit={(id, data) => handleEdit("fechamento", id, data)}
          onDelete={deleteMessage}
          isLoading={isCreating || isUpdating}
        />

        {/* Painel 4: Compreendendo e Superando Objeções */}
        <PlaybookSection
          title="4. Compreendendo e Superando Objeções"
          description="A estratégia para objeções deve ser registrada no CRM para referência futura"
          columns={[
            { key: "categoria", label: "Categoria", width: "w-[140px]" },
            { key: "objecaoComum", label: "Objeção Comum", width: "w-[180px]" },
            { key: "estrategia", label: "Estratégia de Resposta", width: "w-[180px]" },
            { key: "scriptExemplo", label: "Script de Exemplo", copyable: true },
          ]}
          data={getObjecoesData()}
          category="objecoes"
          hasUserData={hasUserObjecoes}
          onAdd={(data) => handleAdd("objecoes", data)}
          onEdit={(id, data) => handleEdit("objecoes", id, data)}
          onDelete={deleteMessage}
          isLoading={isCreating || isUpdating}
        />

        {/* Painel 5: Utilizando Depoimentos (Prova Social) */}
        <PlaybookSection
          title="5. Utilizando Depoimentos (Prova Social)"
          description="Use estes exemplos de depoimentos como scripts de prova social no seu CRM"
          columns={[
            { key: "objecao", label: "Objeção a Superar", width: "w-[200px]" },
            { key: "depoimento", label: "Depoimento Chave", copyable: true },
          ]}
          data={getDepoimentosData()}
          category="depoimentos"
          hasUserData={hasUserDepoimentos}
          onAdd={(data) => handleAdd("depoimentos", data)}
          onEdit={(id, data) => handleEdit("depoimentos", id, data)}
          onDelete={deleteMessage}
          isLoading={isCreating || isUpdating}
        />
      </section>
    </main>
  );
};

export default PlaybookMensagensV2Page;
