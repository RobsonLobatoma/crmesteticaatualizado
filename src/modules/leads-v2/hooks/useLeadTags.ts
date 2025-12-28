import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { LeadTag } from "../types/Lead";

export interface CreateTagDTO {
  name: string;
  color: string;
}

export interface UpdateTagDTO {
  id: string;
  name?: string;
  color?: string;
  is_active?: boolean;
}

export const useLeadTags = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tags, setTags] = useState<LeadTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("lead_tags")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      setTags(
        (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          color: row.color,
          is_active: row.is_active,
        }))
      );
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao carregar tags:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const createTag = async (dto: CreateTagDTO): Promise<LeadTag | null> => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from("lead_tags")
        .insert({
          user_id: user.id,
          name: dto.name,
          color: dto.color,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;

      const newTag: LeadTag = {
        id: data.id,
        name: data.name,
        color: data.color,
        is_active: data.is_active,
      };

      setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({
        title: "Tag criada",
        description: `Tag "${dto.name}" criada com sucesso.`,
      });

      return newTag;
    } catch (err: any) {
      toast({
        title: "Erro ao criar tag",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTag = async (dto: UpdateTagDTO): Promise<LeadTag | null> => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { id, ...updateData } = dto;
      
      const { data, error: updateError } = await supabase
        .from("lead_tags")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      const updatedTag: LeadTag = {
        id: data.id,
        name: data.name,
        color: data.color,
        is_active: data.is_active,
      };

      setTags((prev) =>
        prev
          .map((t) => (t.id === id ? updatedTag : t))
          .filter((t) => t.is_active)
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      toast({
        title: "Tag atualizada",
        description: `Tag "${data.name}" atualizada com sucesso.`,
      });

      return updatedTag;
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar tag",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteTag = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from("lead_tags")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      setTags((prev) => prev.filter((t) => t.id !== id));

      toast({
        title: "Tag excluída",
        description: "Tag excluída com sucesso.",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Erro ao excluir tag",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    refresh: loadTags,
  };
};
