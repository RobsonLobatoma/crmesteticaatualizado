import { format } from "date-fns";
import { DashDiarioEntry } from "../types/DashDiario";
import { Lead } from "@/modules/leads-v2/types/Lead";

const parseDateFlexible = (value?: string | null): Date | null => {
  if (!value) return null;

  // Normaliza strings ISO com horário (ex: 2025-12-23T00:00:00Z) para só a parte da data
  if (value.includes("-")) {
    const [datePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    if (!year || !month || !day) return null;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Formato brasileiro dd/MM/yyyy
  if (value.includes("/")) {
    const [day, month, year] = value.split("/").map(Number);
    if (!day || !month || !year) return null;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const increment = (value: string, amount = 1): string => {
  const current = Number(value || "0") || 0;
  return String(current + amount);
};

const sumCurrencyString = (value: string, amount: number): string => {
  const current = Number(value.replace(/[^0-9,-]/g, "").replace(".", "").replace(",", ".")) || 0;
  const total = current + amount;
  return total.toString();
};

export const criarEntradasDoMes = (ano: number, mesIndex: number): DashDiarioEntry[] => {
  const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();

  return Array.from({ length: ultimoDia }, (_, i) => {
    const dia = i + 1;
    const data = new Date(ano, mesIndex, dia);

    return {
      data: format(data, "dd/MM/yyyy"),
      leadsNovosTotal: "",
      leadsNovosWhatsapp: "",
      leadsNovosInstagram: "",
      conversadosTotal: "",
      conversadosWhatsapp: "",
      conversadosInstagram: "",
      followUpTotal: "",
      agendadasHojeTotal: "",
      avaliacoesHoje: "",
      compareceramHoje: "",
      showRatePercent: "",
      fechamentosHoje: "",
      valorFechadoHoje: "",
    };
  });
};

export const criarEntradasDoMesComLeads = (
  ano: number,
  mesIndex: number,
  leads: Lead[],
): DashDiarioEntry[] => {
  const entradas = criarEntradasDoMes(ano, mesIndex);

  // Função auxiliar para verificar se uma data pertence ao mês/ano selecionado e retornar o índice do dia
  const getDayIndexForDate = (dateStr?: string | null): number | null => {
    const date = parseDateFlexible(dateStr);
    if (!date) return null;
    if (date.getFullYear() !== ano || date.getMonth() !== mesIndex) return null;
    return date.getDate() - 1; // índice 0-based
  };

  leads.forEach((lead) => {
    const origem = (lead.origem || "").toLowerCase();
    const status = (lead.status || "").toLowerCase();

    // === LEADS NOVOS (baseado em dataEntrada) ===
    const indexEntrada = getDayIndexForDate(lead.dataEntrada);
    if (indexEntrada !== null && entradas[indexEntrada]) {
      const entrada = entradas[indexEntrada];
      entrada.leadsNovosTotal = increment(entrada.leadsNovosTotal);
      if (origem.includes("whatsapp")) {
        entrada.leadsNovosWhatsapp = increment(entrada.leadsNovosWhatsapp);
      }
      if (origem.includes("instagram")) {
        entrada.leadsNovosInstagram = increment(entrada.leadsNovosInstagram);
      }
    }

    // === CONVERSADOS (restrito a leads novos do dia que foram conversados no mesmo dia) ===
    const indexContato = getDayIndexForDate(lead.dataUltimoContato);
    // Só conta como conversado se o lead ENTROU e FOI CONVERSADO no mesmo dia
    if (indexContato !== null && indexEntrada !== null && indexContato === indexEntrada && entradas[indexContato]) {
      const entrada = entradas[indexContato];
      entrada.conversadosTotal = increment(entrada.conversadosTotal);
      if (origem.includes("whatsapp")) {
        entrada.conversadosWhatsapp = increment(entrada.conversadosWhatsapp);
      }
      if (origem.includes("instagram")) {
        entrada.conversadosInstagram = increment(entrada.conversadosInstagram);
      }
    }

    // === FOLLOW-UP (status contendo "follow") - conta no dia de entrada ===
    if (status.includes("follow") && indexEntrada !== null && entradas[indexEntrada]) {
      entradas[indexEntrada].followUpTotal = increment(entradas[indexEntrada].followUpTotal);
    }

    // === AGENDADAS (baseado em dataAgendamento) ===
    const indexAgendamento = getDayIndexForDate(lead.dataAgendamento);
    if (indexAgendamento !== null && entradas[indexAgendamento]) {
      entradas[indexAgendamento].agendadasHojeTotal = increment(entradas[indexAgendamento].agendadasHojeTotal);
    }

    // === AVALIAÇÕES (baseado em dataAvaliacao) ===
    const indexAvaliacao = getDayIndexForDate(lead.dataAvaliacao);
    if (indexAvaliacao !== null && entradas[indexAvaliacao]) {
      entradas[indexAvaliacao].avaliacoesHoje = increment(entradas[indexAvaliacao].avaliacoesHoje);
    }

    // === COMPARECERAM (baseado em compareceu + dataAvaliacao) ===
    const compareceu = (lead.compareceu || "").toLowerCase();
    if ((compareceu === "sim" || compareceu === "s") && indexAvaliacao !== null && entradas[indexAvaliacao]) {
      entradas[indexAvaliacao].compareceramHoje = increment(entradas[indexAvaliacao].compareceramHoje);
    }

    // === FECHAMENTOS (baseado em dataFechamento OU status de fechamento) ===
    const indexFechamento = getDayIndexForDate(lead.dataFechamento);
    const isFechamentoStatus =
      status === "fechou" ||
      status.includes("fechado") ||
      status.includes("fechou") ||
      status.includes("vendido") ||
      status.includes("convertido");

    // Usa dataFechamento se disponível, senão usa dataEntrada para status de fechamento
    const indexParaFechamento = indexFechamento !== null ? indexFechamento : 
      (isFechamentoStatus && indexEntrada !== null ? indexEntrada : null);

    if (indexParaFechamento !== null && entradas[indexParaFechamento]) {
      // Só conta como fechamento se tem dataFechamento OU status indica fechamento
      if (indexFechamento !== null || isFechamentoStatus) {
        entradas[indexParaFechamento].fechamentosHoje = increment(entradas[indexParaFechamento].fechamentosHoje);

        const valor = Number(
          (lead.valorFechado || "0")
            .replace(/[^0-9,-]/g, "")
            .replace(".", "")
            .replace(",", "."),
        );

        if (!Number.isNaN(valor) && valor > 0) {
          entradas[indexParaFechamento].valorFechadoHoje = sumCurrencyString(
            entradas[indexParaFechamento].valorFechadoHoje,
            valor,
          );
        }
      }
    }
  });

  // === CALCULAR SHOW RATE para cada dia ===
  entradas.forEach((entrada) => {
    const avaliacoes = Number(entrada.avaliacoesHoje || "0") || 0;
    const compareceram = Number(entrada.compareceramHoje || "0") || 0;
    if (avaliacoes > 0) {
      const percent = (compareceram / avaliacoes) * 100;
      entrada.showRatePercent = `${percent.toFixed(1)}`;
    }
  });

  return entradas;
};
