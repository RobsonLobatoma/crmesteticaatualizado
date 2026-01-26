import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WhatsappTemplate, WhatsappTemplateType, WhatsappTemplateTriggerType } from "../types";

interface TemplateFormData {
  name: string;
  content: string;
  type: WhatsappTemplateType;
  trigger_type: WhatsappTemplateTriggerType;
  trigger_value: string;
  is_active: boolean;
}

export function useWhatsappTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setTemplates([]);
        return;
      }

      const { data, error } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: WhatsappTemplate[] = (data || []).map((t) => ({
        id: t.id,
        name: t.name,
        content: t.content,
        type: t.type as WhatsappTemplateType,
        trigger: t.trigger_type as WhatsappTemplateTriggerType,
        triggerValue: t.trigger_value || "",
        active: t.is_active,
      }));

      setTemplates(mapped);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (formData: TemplateFormData): Promise<boolean> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("Não autenticado");
      }

      const { error } = await supabase.from("whatsapp_templates").insert({
        user_id: sessionData.session.user.id,
        name: formData.name,
        content: formData.content,
        type: formData.type,
        trigger_type: formData.trigger_type,
        trigger_value: formData.trigger_value,
        is_active: formData.is_active,
      });

      if (error) throw error;

      toast({
        title: "Template criado",
        description: `O template "${formData.name}" foi criado com sucesso.`,
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error("Erro ao criar template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o template",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateTemplate = async (
    id: string,
    formData: Partial<TemplateFormData>
  ): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (formData.name !== undefined) updateData.name = formData.name;
      if (formData.content !== undefined) updateData.content = formData.content;
      if (formData.type !== undefined) updateData.type = formData.type;
      if (formData.trigger_type !== undefined) updateData.trigger_type = formData.trigger_type;
      if (formData.trigger_value !== undefined) updateData.trigger_value = formData.trigger_value;
      if (formData.is_active !== undefined) updateData.is_active = formData.is_active;

      const { error } = await supabase
        .from("whatsapp_templates")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template atualizado",
        description: "O template foi atualizado com sucesso.",
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o template",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("whatsapp_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template removido",
        description: "O template foi removido com sucesso.",
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error("Erro ao remover template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o template",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleActive = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateTemplate(id, { is_active: isActive });
  };

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleActive,
    refetch: fetchTemplates,
  };
}
