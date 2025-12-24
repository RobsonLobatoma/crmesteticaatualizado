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
      leadsNovosTotal: "0",
      leadsNovosWhatsapp: "0",
      leadsNovosInstagram: "0",
      conversadosTotal: "0",
      conversadosWhatsapp: "0",
      conversadosInstagram: "0",
      followUpTotal: "0",
      agendadasHojeTotal: "0",
      avaliacoesHoje: "0",
      compareceramHoje: "0",
      showRatePercent: "0",
      fechamentosHoje: "0",
      valorFechadoHoje: "0",
    };
  });
};

export const criarEntradasDoMesComLeads = (
  ano: number,
  mesIndex: number,
  leads: Lead[],
): DashDiarioEntry[] => {
  const entradas = criarEntradasDoMes(ano, mesIndex);

  leads.forEach((lead) => {
    const dataEntrada = parseDateFlexible(lead.dataEntrada || lead.data);
    if (!dataEntrada) return;

    if (
      dataEntrada.getFullYear() !== ano ||
      dataEntrada.getMonth() !== mesIndex
    ) {
      return;
    }

    const dia = dataEntrada.getDate();
    const index = dia - 1;
    if (!entradas[index]) return;

    const entrada = entradas[index];
    const origem = (lead.origem || "").toLowerCase();
    const status = (lead.status || "").toLowerCase();

    // Leads novos
    entrada.leadsNovosTotal = increment(entrada.leadsNovosTotal);
    if (origem === "whatsapp") {
      entrada.leadsNovosWhatsapp = increment(entrada.leadsNovosWhatsapp);
    }
    if (origem === "instagram") {
      entrada.leadsNovosInstagram = increment(entrada.leadsNovosInstagram);
    }

    // Conversados (usa dataUltimoContato)
    const dataUltimoContato = parseDateFlexible(lead.dataUltimoContato);
    if (dataUltimoContato) {
      const mesmoDia =
        dataUltimoContato.getFullYear() === ano &&
        dataUltimoContato.getMonth() === mesIndex &&
        dataUltimoContato.getDate() === dia;

      if (mesmoDia) {
        entrada.conversadosTotal = increment(entrada.conversadosTotal);
        if (origem === "whatsapp") {
          entrada.conversadosWhatsapp = increment(
            entrada.conversadosWhatsapp,
          );
        }
        if (origem === "instagram") {
          entrada.conversadosInstagram = increment(
            entrada.conversadosInstagram,
          );
        }
      }
    }

    // Follow-up (usa status contendo "follow")
    if (status.includes("follow")) {
      entrada.followUpTotal = increment(entrada.followUpTotal);
    }

    // Agendadas hoje (usa dataAgendamento)
    const dataAgendamento = parseDateFlexible(lead.dataAgendamento);
    if (dataAgendamento) {
      const mesmoDia =
        dataAgendamento.getFullYear() === ano &&
        dataAgendamento.getMonth() === mesIndex &&
        dataAgendamento.getDate() === dia;

      if (mesmoDia) {
        entrada.agendadasHojeTotal = increment(entrada.agendadasHojeTotal);
      }
    }

    // Avaliações hoje (usa dataAvaliacao)
    const dataAvaliacao = parseDateFlexible(lead.dataAvaliacao);
    if (dataAvaliacao) {
      const mesmoDia =
        dataAvaliacao.getFullYear() === ano &&
        dataAvaliacao.getMonth() === mesIndex &&
        dataAvaliacao.getDate() === dia;

      if (mesmoDia) {
        entrada.avaliacoesHoje = increment(entrada.avaliacoesHoje);
      }
    }

    // Compareceram hoje (usa campo compareceu + dataAvaliacao)
    const compareceu = (lead.compareceu || "").toLowerCase();
    if (compareceu === "sim" && dataAvaliacao) {
      const mesmoDia =
        dataAvaliacao.getFullYear() === ano &&
        dataAvaliacao.getMonth() === mesIndex &&
        dataAvaliacao.getDate() === dia;

      if (mesmoDia) {
        entrada.compareceramHoje = increment(entrada.compareceramHoje);
      }
    }

    // Fechamentos e valor fechado (usa dataFechamento + status atual de fechamento)
    const dataFechamento = parseDateFlexible(lead.dataFechamento);
    const statusFechamento = (lead.status || "").toLowerCase();
    const isFechamentoStatus =
      statusFechamento === "fechou" ||
      statusFechamento.includes("fechado") ||
      statusFechamento.includes("fechou");

    if (isFechamentoStatus && dataFechamento) {
      const mesmoDia =
        dataFechamento.getFullYear() === ano &&
        dataFechamento.getMonth() === mesIndex &&
        dataFechamento.getDate() === dia;

      if (mesmoDia) {
        entrada.fechamentosHoje = increment(entrada.fechamentosHoje);

        const valor = Number(
          (lead.valorFechado || "0")
            .replace(/[^0-9,-]/g, "")
            .replace(".", "")
            .replace(",", "."),
        );

        if (!Number.isNaN(valor) && valor > 0) {
          entrada.valorFechadoHoje = sumCurrencyString(
            entrada.valorFechadoHoje,
            valor,
          );
        }
      }
    }

    // Show rate (%) = compareceram / avaliacoes * 100
    const avaliacoes = Number(entrada.avaliacoesHoje || "0") || 0;
    const compareceram = Number(entrada.compareceramHoje || "0") || 0;
    if (avaliacoes > 0) {
      const percent = (compareceram / avaliacoes) * 100;
      entrada.showRatePercent = `${percent.toFixed(1)}`;
    }
  });

  return entradas;
};
