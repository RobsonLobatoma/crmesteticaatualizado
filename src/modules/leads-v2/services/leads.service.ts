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
      email: row.email || undefined,
      origem: row.origem || "Manual",
      procedimento: row.procedimento || "-",
      status: row.status || "Novo lead",
      dataEntrada: row.data_entrada || fallbackDate,
      dataUltimoContato: row.data_ultimo_contato || undefined,
      dataAgendamento: row.data_agendamento || undefined,
      dataAvaliacao: row.data_avaliacao || undefined,
      dataProcedimento: row.data_procedimento || undefined,
      compareceu: row.compareceu || undefined,
      dataFechamento: row.data_fechamento || undefined,
      valorFechado: row.valor_fechado || undefined,
      observacao: row.observacao || undefined,
      // Novos campos de endereço
      dataNascimento: row.data_nascimento || undefined,
      cpf: row.cpf || undefined,
      cep: row.cep || undefined,
      endereco: row.endereco || undefined,
      bairro: row.bairro || undefined,
      cidade: row.cidade || undefined,
      estado: row.estado || undefined,
      numero: row.numero || undefined,
      complemento: row.complemento || undefined,
      // Tags
      tags: row.tags || [],
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

    const insertPayload = {
      user_id: userId,
      data: dto.dataEntrada || hoje,
      responsavel: dto.responsavel || "-",
      nome: dto.nome,
      contato: dto.contato,
      email: dto.email || null,
      origem: dto.origem || "Manual",
      procedimento: dto.procedimento || "-",
      status: dto.status || "Novo lead",
      data_entrada: dto.dataEntrada || hoje,
      data_ultimo_contato: dto.dataUltimoContato || null,
      data_agendamento: dto.dataAgendamento || null,
      data_avaliacao: dto.dataAvaliacao || null,
      data_procedimento: dto.dataProcedimento || null,
      compareceu: dto.compareceu || null,
      data_fechamento: dto.dataFechamento || null,
      valor_fechado: dto.valorFechado || null,
      observacao: dto.observacao || null,
      // Campos de endereço
      data_nascimento: dto.dataNascimento || null,
      cpf: dto.cpf || null,
      cep: dto.cep || null,
      endereco: dto.endereco || null,
      bairro: dto.bairro || null,
      cidade: dto.cidade || null,
      estado: dto.estado || null,
      numero: dto.numero || null,
      complemento: dto.complemento || null,
      // Tags
      tags: dto.tags || [],
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
      ...("dataProcedimento" in rest && { data_procedimento: rest.dataProcedimento }),
      ...("compareceu" in rest && { compareceu: rest.compareceu }),
      ...("dataFechamento" in rest && { data_fechamento: rest.dataFechamento }),
      ...("valorFechado" in rest && { valor_fechado: rest.valorFechado }),
      ...("observacao" in rest && { observacao: rest.observacao }),
      // Novos campos de endereço
      ...("dataNascimento" in rest && { data_nascimento: rest.dataNascimento }),
      ...("cpf" in rest && { cpf: rest.cpf }),
      ...("cep" in rest && { cep: rest.cep }),
      ...("endereco" in rest && { endereco: rest.endereco }),
      ...("bairro" in rest && { bairro: rest.bairro }),
      ...("cidade" in rest && { cidade: rest.cidade }),
      ...("estado" in rest && { estado: rest.estado }),
      ...("numero" in rest && { numero: rest.numero }),
      ...("complemento" in rest && { complemento: rest.complemento }),
      // Tags
      ...("tags" in rest && { tags: rest.tags }),
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
