import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Professional {
  id: string;
  name: string;
  role: string | null;
  color: string | null;
  is_active: boolean;
  user_id: string;
  created_at: string | null;
}

export interface Service {
  id: string;
  name: string;
  price: number | null;
  duration_minutes: number | null;
  is_active: boolean;
  user_id: string;
  created_at: string | null;
}

export interface Room {
  id: string;
  name: string;
  capacity: number | null;
  is_active: boolean;
  user_id: string;
  created_at: string | null;
}

export interface Equipment {
  id: string;
  name: string;
  is_active: boolean;
  user_id: string;
  created_at: string | null;
}

export function useProfessionalsAdmin() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar profissionais", variant: "destructive" });
    } else {
      setProfessionals(data.map(p => ({ ...p, is_active: p.is_active ?? true })));
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const createProfessional = async (data: Omit<Professional, "id" | "created_at">) => {
    const { error } = await supabase.from("professionals").insert(data);
    if (error) {
      toast({ title: "Erro", description: "Erro ao criar profissional", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Profissional criado com sucesso" });
    await fetchProfessionals();
    return true;
  };

  const updateProfessional = async (id: string, data: Partial<Professional>) => {
    const { error } = await supabase.from("professionals").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao atualizar profissional", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Profissional atualizado com sucesso" });
    await fetchProfessionals();
    return true;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateProfessional(id, { is_active: isActive });
  };

  const deleteProfessional = async (id: string) => {
    const { error } = await supabase.from("professionals").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao excluir profissional. Pode estar vinculado a agendamentos.", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Profissional excluído com sucesso" });
    await fetchProfessionals();
    return true;
  };

  return { professionals, isLoading, fetchProfessionals, createProfessional, updateProfessional, toggleActive, deleteProfessional };
}

export function useServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar serviços", variant: "destructive" });
    } else {
      setServices(data.map(s => ({ ...s, is_active: s.is_active ?? true })));
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = async (data: Omit<Service, "id" | "created_at">) => {
    const { error } = await supabase.from("services").insert(data);
    if (error) {
      toast({ title: "Erro", description: "Erro ao criar serviço", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Serviço criado com sucesso" });
    await fetchServices();
    return true;
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    const { error } = await supabase.from("services").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao atualizar serviço", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Serviço atualizado com sucesso" });
    await fetchServices();
    return true;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateService(id, { is_active: isActive });
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao excluir serviço. Pode estar vinculado a agendamentos.", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Serviço excluído com sucesso" });
    await fetchServices();
    return true;
  };

  return { services, isLoading, fetchServices, createService, updateService, toggleActive, deleteService };
}

export function useRoomsAdmin() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar salas", variant: "destructive" });
    } else {
      setRooms(data.map(r => ({ ...r, is_active: r.is_active ?? true })));
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (data: Omit<Room, "id" | "created_at">) => {
    const { error } = await supabase.from("rooms").insert(data);
    if (error) {
      toast({ title: "Erro", description: "Erro ao criar sala", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Sala criada com sucesso" });
    await fetchRooms();
    return true;
  };

  const updateRoom = async (id: string, data: Partial<Room>) => {
    const { error } = await supabase.from("rooms").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao atualizar sala", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Sala atualizada com sucesso" });
    await fetchRooms();
    return true;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateRoom(id, { is_active: isActive });
  };

  const deleteRoom = async (id: string) => {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao excluir sala. Pode estar vinculada a agendamentos.", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Sala excluída com sucesso" });
    await fetchRooms();
    return true;
  };

  return { rooms, isLoading, fetchRooms, createRoom, updateRoom, toggleActive, deleteRoom };
}

export function useEquipmentsAdmin() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEquipments = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("equipments")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar equipamentos", variant: "destructive" });
    } else {
      setEquipments(data.map(e => ({ ...e, is_active: e.is_active ?? true })));
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  const createEquipment = async (data: Omit<Equipment, "id" | "created_at">) => {
    const { error } = await supabase.from("equipments").insert(data);
    if (error) {
      toast({ title: "Erro", description: "Erro ao criar equipamento", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Equipamento criado com sucesso" });
    await fetchEquipments();
    return true;
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    const { error } = await supabase.from("equipments").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao atualizar equipamento", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Equipamento atualizado com sucesso" });
    await fetchEquipments();
    return true;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateEquipment(id, { is_active: isActive });
  };

  const deleteEquipment = async (id: string) => {
    const { error } = await supabase.from("equipments").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Erro ao excluir equipamento. Pode estar vinculado a agendamentos.", variant: "destructive" });
      return false;
    }
    toast({ title: "Sucesso", description: "Equipamento excluído com sucesso" });
    await fetchEquipments();
    return true;
  };

  return { equipments, isLoading, fetchEquipments, createEquipment, updateEquipment, toggleActive, deleteEquipment };
}
