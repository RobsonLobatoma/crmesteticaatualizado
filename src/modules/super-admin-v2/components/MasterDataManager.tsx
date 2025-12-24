import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, ToggleLeft, ToggleRight, Loader2, Users, Briefcase, DoorOpen, Wrench } from "lucide-react";
import {
  useProfessionalsAdmin,
  useServicesAdmin,
  useRoomsAdmin,
  useEquipmentsAdmin,
  type Professional,
  type Service,
  type Room,
  type Equipment,
} from "../hooks/useMasterData";
import { ProfessionalFormModal } from "./ProfessionalFormModal";
import { ServiceFormModal } from "./ServiceFormModal";
import { RoomFormModal } from "./RoomFormModal";
import { EquipmentFormModal } from "./EquipmentFormModal";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MasterDataManager({ open, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState("professionals");
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user id
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  });

  const professionalsHook = useProfessionalsAdmin();
  const servicesHook = useServicesAdmin();
  const roomsHook = useRoomsAdmin();
  const equipmentsHook = useEquipmentsAdmin();

  // Modal states
  const [professionalModal, setProfessionalModal] = useState<{ open: boolean; item: Professional | null }>({ open: false, item: null });
  const [serviceModal, setServiceModal] = useState<{ open: boolean; item: Service | null }>({ open: false, item: null });
  const [roomModal, setRoomModal] = useState<{ open: boolean; item: Room | null }>({ open: false, item: null });
  const [equipmentModal, setEquipmentModal] = useState<{ open: boolean; item: Equipment | null }>({ open: false, item: null });

  const handleSaveProfessional = async (data: Partial<Professional>) => {
    if (professionalModal.item) {
      return professionalsHook.updateProfessional(professionalModal.item.id, data);
    }
    return professionalsHook.createProfessional(data as Omit<Professional, "id" | "created_at">);
  };

  const handleSaveService = async (data: Partial<Service>) => {
    if (serviceModal.item) {
      return servicesHook.updateService(serviceModal.item.id, data);
    }
    return servicesHook.createService(data as Omit<Service, "id" | "created_at">);
  };

  const handleSaveRoom = async (data: Partial<Room>) => {
    if (roomModal.item) {
      return roomsHook.updateRoom(roomModal.item.id, data);
    }
    return roomsHook.createRoom(data as Omit<Room, "id" | "created_at">);
  };

  const handleSaveEquipment = async (data: Partial<Equipment>) => {
    if (equipmentModal.item) {
      return equipmentsHook.updateEquipment(equipmentModal.item.id, data);
    }
    return equipmentsHook.createEquipment(data as Omit<Equipment, "id" | "created_at">);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Dados do Agendamento</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="professionals" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Profissionais</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Procedimentos</span>
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex items-center gap-1">
                <DoorOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Salas</span>
              </TabsTrigger>
              <TabsTrigger value="equipments" className="flex items-center gap-1">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Equipamentos</span>
              </TabsTrigger>
            </TabsList>

            {/* Professionals Tab */}
            <TabsContent value="professionals" className="flex-1 overflow-auto">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setProfessionalModal({ open: true, item: null })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {professionalsHook.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionalsHook.professionals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhum profissional cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      professionalsHook.professionals.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.role || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border"
                                style={{ backgroundColor: p.color || "#3B82F6" }}
                              />
                              <span className="text-xs text-muted-foreground">{p.color}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.is_active ? "default" : "secondary"}>
                              {p.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setProfessionalModal({ open: true, item: p })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => professionalsHook.toggleActive(p.id, !p.is_active)}
                            >
                              {p.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="flex-1 overflow-auto">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setServiceModal({ open: true, item: null })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {servicesHook.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicesHook.services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhum procedimento cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      servicesHook.services.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{formatCurrency(s.price)}</TableCell>
                          <TableCell>{s.duration_minutes ? `${s.duration_minutes} min` : "-"}</TableCell>
                          <TableCell>
                            <Badge variant={s.is_active ? "default" : "secondary"}>
                              {s.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setServiceModal({ open: true, item: s })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => servicesHook.toggleActive(s.id, !s.is_active)}
                            >
                              {s.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="flex-1 overflow-auto">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setRoomModal({ open: true, item: null })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {roomsHook.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomsHook.rooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhuma sala cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      roomsHook.rooms.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell>{r.capacity || 1} pessoa(s)</TableCell>
                          <TableCell>
                            <Badge variant={r.is_active ? "default" : "secondary"}>
                              {r.is_active ? "Ativa" : "Inativa"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setRoomModal({ open: true, item: r })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => roomsHook.toggleActive(r.id, !r.is_active)}
                            >
                              {r.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Equipments Tab */}
            <TabsContent value="equipments" className="flex-1 overflow-auto">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setEquipmentModal({ open: true, item: null })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {equipmentsHook.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentsHook.equipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum equipamento cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      equipmentsHook.equipments.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.name}</TableCell>
                          <TableCell>
                            <Badge variant={e.is_active ? "default" : "secondary"}>
                              {e.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEquipmentModal({ open: true, item: e })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => equipmentsHook.toggleActive(e.id, !e.is_active)}
                            >
                              {e.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Form Modals */}
      {userId && (
        <>
          <ProfessionalFormModal
            open={professionalModal.open}
            onOpenChange={(open) => setProfessionalModal({ ...professionalModal, open })}
            professional={professionalModal.item}
            onSave={handleSaveProfessional}
            userId={userId}
          />
          <ServiceFormModal
            open={serviceModal.open}
            onOpenChange={(open) => setServiceModal({ ...serviceModal, open })}
            service={serviceModal.item}
            onSave={handleSaveService}
            userId={userId}
          />
          <RoomFormModal
            open={roomModal.open}
            onOpenChange={(open) => setRoomModal({ ...roomModal, open })}
            room={roomModal.item}
            onSave={handleSaveRoom}
            userId={userId}
          />
          <EquipmentFormModal
            open={equipmentModal.open}
            onOpenChange={(open) => setEquipmentModal({ ...equipmentModal, open })}
            equipment={equipmentModal.item}
            onSave={handleSaveEquipment}
            userId={userId}
          />
        </>
      )}
    </>
  );
}
