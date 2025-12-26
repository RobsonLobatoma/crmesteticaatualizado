import { supabase } from "@/integrations/supabase/client";
import { Lead, CreateLeadDTO, UpdateLeadDTO } from "../types/Lead";

/**
 * Serviço para gerenciar leads persistidos no Supabase
 * Usa a tabela public.leads como fonte única de verdade.
 */
class LeadsService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Converte uma linha do banco (public.leads) para o modelo Lead usado no frontend.
   */
  private mapRowToLead(row: any): Lead {
    const fallbackDate = row.created_at
      ? new Date(row.created_at).toLocaleDateString("pt-BR")
      : "";

    return {
      id: row.id,
      responsavel: row.responsavel || "-",
      nome: row.nome,
      contato: row.contato,
      origem: row.origem || "Manual",
      procedimento: row.procedimento || "-",
      status: row.status || "Novo lead",
      dataEntrada: row.data_entrada || fallbackDate,
      dataUltimoContato: row.data_ultimo_contato || undefined,
      dataAgendamento: row.data_agendamento || undefined,
      dataAvaliacao: row.data_avaliacao || undefined,
      compareceu: row.compareceu || undefined,
      dataFechamento: row.data_fechamento || undefined,
      valorFechado: row.valor_fechado || undefined,
      observacao: row.observacao || undefined,
    };
  }

  private getHojePtBr() {
    return new Date().toLocaleDateString("pt-BR");
  }

  async getAll(userId: string): Promise<Lead[]> {
    await this.delay(100);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row) => this.mapRowToLead(row));
  }

  async getById(id: string, userId: string): Promise<Lead | undefined> {
    await this.delay(50);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? this.mapRowToLead(data) : undefined;
  }

  async create(dto: CreateLeadDTO, userId: string): Promise<Lead> {
    await this.delay(150);

    const hoje = this.getHojePtBr();

    const dtoAny: any = dto;

    const insertPayload = {
      user_id: userId,
      data: dtoAny.data || hoje,
      responsavel: dto.responsavel || "-",
      nome: dto.nome,
      contato: dto.contato,
      origem: dto.origem || "Manual",
      procedimento: dtoAny.procedimento || "-",
      status: dtoAny.status || "Novo lead",
      data_entrada: dtoAny.dataEntrada || hoje,
      data_ultimo_contato: dtoAny.dataUltimoContato || null,
      data_agendamento: dtoAny.dataAgendamento || null,
      data_avaliacao: dtoAny.dataAvaliacao || null,
      compareceu: dtoAny.compareceu || null,
      data_fechamento: dtoAny.dataFechamento || null,
      valor_fechado: dtoAny.valorFechado || null,
      observacao: dtoAny.observacao || null,
    };

    const { data, error } = await supabase
      .from("leads")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapRowToLead(data);
  }

  async update(dto: UpdateLeadDTO, userId: string): Promise<Lead> {
    await this.delay(150);

    const { id, ...rest } = dto;

    const updatePayload: any = {
      ...("data" in rest && { data: rest.data }),
      ...("responsavel" in rest && { responsavel: rest.responsavel }),
      ...("nome" in rest && { nome: rest.nome }),
      ...("contato" in rest && { contato: rest.contato }),
      ...("origem" in rest && { origem: rest.origem }),
      ...("procedimento" in rest && { procedimento: rest.procedimento }),
      ...("status" in rest && { status: rest.status }),
      ...("dataEntrada" in rest && { data_entrada: rest.dataEntrada }),
      ...("dataUltimoContato" in rest && {
        data_ultimo_contato: rest.dataUltimoContato,
      }),
      ...("dataAgendamento" in rest && { data_agendamento: rest.dataAgendamento }),
      ...("dataAvaliacao" in rest && { data_avaliacao: rest.dataAvaliacao }),
      ...("compareceu" in rest && { compareceu: rest.compareceu }),
      ...("dataFechamento" in rest && { data_fechamento: rest.dataFechamento }),
      ...("valorFechado" in rest && { valor_fechado: rest.valorFechado }),
      ...("observacao" in rest && { observacao: rest.observacao }),
    };

    const { data, error } = await supabase
      .from("leads")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapRowToLead(data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.delay(100);

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Mantido apenas para compatibilidade com o código antigo.
   * Agora não faz nada, pois os dados estão no Supabase.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset(): void {}
}

export const leadsService = new LeadsService();
