import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AgendaSettingsCards } from "@/components/settings/AgendaSettingsCards";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/AuthProvider";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { Loader2, Shield, User, Mail, UserPlus, UserMinus, Crown, Tags, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCRMStatuses, CRMStatus } from "@/modules/kanbam-v2/hooks/useCRMStatuses";
import { StatusFormModal } from "@/modules/kanbam-v2/components/StatusFormModal";

type AppRole = "super_admin" | "admin" | "moderator" | "user";

interface UserWithRoles {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: AppRole[];
}

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSuperAdmin, loading: superAdminLoading } = useIsSuperAdmin();
  
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [invitesModalOpen, setInvitesModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Status management
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CRMStatus | null>(null);
  const { statuses, isLoading: statusesLoading, createStatus, updateStatus, deleteStatus } = useCRMStatuses();

  const fetchUsersWithRoles = async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, display_name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
        const userRoles = (roles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role as AppRole);
        
        return {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          roles: userRoles.length > 0 ? userRoles : ["user"],
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!superAdminLoading) {
      fetchUsersWithRoles();
    }
  }, [isSuperAdmin, superAdminLoading]);

  const assignRole = async (userId: string, role: AppRole) => {
    setActionLoading(userId);
    try {
      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", role)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Papel já atribuído",
          description: "Este usuário já possui este papel.",
        });
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast({
        title: "Papel atribuído",
        description: `O papel "${role}" foi atribuído com sucesso.`,
      });

      fetchUsersWithRoles();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Erro ao atribuir papel",
        description: "Não foi possível atribuir o papel.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    // Prevent revoking super_admin from self
    if (userId === user?.id && role === "super_admin") {
      toast({
        title: "Ação não permitida",
        description: "Você não pode remover seu próprio papel de super admin.",
        variant: "destructive",
      });
      return;
    }

    // Check if there's at least one other super_admin
    if (role === "super_admin") {
      const superAdmins = users.filter((u) => u.roles.includes("super_admin"));
      if (superAdmins.length <= 1) {
        toast({
          title: "Ação não permitida",
          description: "Deve haver pelo menos um super admin no sistema.",
          variant: "destructive",
        });
        return;
      }
    }

    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast({
        title: "Papel removido",
        description: `O papel "${role}" foi removido com sucesso.`,
      });

      fetchUsersWithRoles();
    } catch (error) {
      console.error("Error revoking role:", error);
      toast({
        title: "Erro ao remover papel",
        description: "Não foi possível remover o papel.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users by role
  const admins = users.filter((u) => u.roles.includes("super_admin") || u.roles.includes("admin"));
  const standardUsers = users.filter((u) => !u.roles.includes("super_admin") && !u.roles.includes("admin"));

  const handleMockAction = (label: string) => {
    toast({
      title: label,
      description: "Aqui você poderá configurar essa área quando o backend estiver conectado.",
    });
  };

  const getRoleBadge = (role: AppRole) => {
    const config: Record<AppRole, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      super_admin: { label: "Super Admin", variant: "default" },
      admin: { label: "Admin", variant: "secondary" },
      moderator: { label: "Moderador", variant: "outline" },
      user: { label: "Usuário", variant: "outline" },
    };
    return config[role] || { label: role, variant: "outline" };
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Configurações do workspace</h1>
            <p className="text-sm text-muted-foreground">
              Painel de super admin, gestão de administradores e planos do seu CRM.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <div>
              <CardTitle className="text-base">Painel de Super admin</CardTitle>
              <CardDescription>Resumo das permissões e da saúde da sua conta.</CardDescription>
            </div>
            {isSuperAdmin && (
              <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
                Super admin
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-subtle px-3 py-2">
                <p className="text-xs text-muted-foreground">Usuários ativos</p>
                <p className="mt-1 text-xl font-semibold">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : users.length}
                </p>
                <p className="text-[11px] text-muted-foreground">Total de usuários cadastrados.</p>
              </div>
              <div className="rounded-lg bg-surface-subtle px-3 py-2">
                <p className="text-xs text-muted-foreground">Administradores</p>
                <p className="mt-1 text-xl font-semibold">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : admins.length}
                </p>
                <p className="text-[11px] text-muted-foreground">Super admins e admins.</p>
              </div>
              <div className="rounded-lg bg-surface-subtle px-3 py-2">
                <p className="text-xs text-muted-foreground">Status do workspace</p>
                <p className="mt-1 text-xl font-semibold text-green-600">Ativo</p>
                <p className="text-[11px] text-muted-foreground">Sistema operacional.</p>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>
                Apenas o <span className="font-semibold">super admin</span> pode alterar planos, gerir administradores e
                encerrar o workspace.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={() => handleMockAction("Área de segurança")}
              >
                Revisar segurança
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gerenciamento de administradores e usuários</CardTitle>
            <CardDescription>
              Convide novos membros, promova para admin e defina o acesso de cada pessoa no CRM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2">
              <div>
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Administradores
                </p>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Carregando..." : `${admins.length} administrador(es) cadastrado(s).`}
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setAdminModalOpen(true)}
                disabled={!isSuperAdmin}
              >
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2">
              <div>
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Usuários padrão
                </p>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Carregando..." : `${standardUsers.length} usuário(s) padrão.`}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs"
                onClick={() => setUsersModalOpen(true)}
                disabled={!isSuperAdmin}
              >
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2">
              <div>
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Convites pendentes
                </p>
                <p className="text-xs text-muted-foreground">Funcionalidade de convites em breve.</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-xs"
                onClick={() => setInvitesModalOpen(true)}
                disabled={!isSuperAdmin}
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modal: Administradores */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gerenciar Administradores
            </DialogTitle>
            <DialogDescription>
              Gerencie os usuários com permissões de administrador.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 pr-4">
              {admins.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum administrador encontrado.
                </p>
              ) : (
                admins.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.display_name || u.email || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.roles.map((role) => {
                          const { label, variant } = getRoleBadge(role);
                          return (
                            <Badge key={role} variant={variant} className="text-[10px]">
                              {label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {u.roles.includes("admin") && !u.roles.includes("super_admin") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => revokeRole(u.id, "admin")}
                          disabled={actionLoading === u.id}
                        >
                          {actionLoading === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserMinus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: Usuários Padrão */}
      <Dialog open={usersModalOpen} onOpenChange={setUsersModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Gerenciar Usuários Padrão
            </DialogTitle>
            <DialogDescription>
              Promova usuários para administrador ou gerencie permissões.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 pr-4">
              {standardUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum usuário padrão encontrado.
                </p>
              ) : (
                standardUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.display_name || u.email || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.roles.map((role) => {
                          const { label, variant } = getRoleBadge(role);
                          return (
                            <Badge key={role} variant={variant} className="text-[10px]">
                              {label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => assignRole(u.id, "admin")}
                      disabled={actionLoading === u.id}
                    >
                      {actionLoading === u.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Crown className="h-3.5 w-3.5" />
                          Promover
                        </>
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: Convites Pendentes */}
      <Dialog open={invitesModalOpen} onOpenChange={setInvitesModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Convites Pendentes
            </DialogTitle>
            <DialogDescription>
              Gerencie os convites enviados para novos membros.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              O sistema de convites será implementado em breve.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Você poderá convidar novos usuários por e-mail e acompanhar os convites pendentes.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Management Panel */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Gerenciar Status
            </CardTitle>
            <CardDescription>
              Crie, edite e exclua os status disponíveis para leads e kanban.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {statusesLoading ? "Carregando..." : `${statuses.length} status cadastrados`}
              </p>
              <Button 
                size="sm" 
                onClick={() => { 
                  setEditingStatus(null); 
                  setStatusModalOpen(true); 
                }}
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Novo Status
              </Button>
            </div>
            
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2 pr-4">
                {statuses.map((status) => (
                  <div 
                    key={status.id} 
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${status.color}`} />
                      <span className="text-sm font-medium">{status.name}</span>
                      <span className="text-xs text-muted-foreground">({status.slug})</span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2"
                        onClick={() => { 
                          setEditingStatus(status); 
                          setStatusModalOpen(true); 
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => deleteStatus.mutate(status.id)}
                        disabled={deleteStatus.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {statuses.length === 0 && !statusesLoading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum status cadastrado. Clique em "Novo Status" para começar.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>

      {/* Status Form Modal */}
      <StatusFormModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        status={editingStatus}
        onSubmit={(data) => {
          if (editingStatus) {
            updateStatus.mutate(
              { id: editingStatus.id, ...data }, 
              { onSuccess: () => setStatusModalOpen(false) }
            );
          } else {
            createStatus.mutate(
              { 
                name: data.name, 
                slug: data.slug, 
                color: data.color, 
                display_order: data.display_order, 
                user_id: user?.id || '', 
                is_active: true 
              }, 
              { onSuccess: () => setStatusModalOpen(false) }
            );
          }
        }}
        isLoading={createStatus.isPending || updateStatus.isPending}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Plano atual
              <Badge className="rounded-full text-[10px] uppercase tracking-wide">Em breve</Badge>
            </CardTitle>
            <CardDescription>Os detalhes do seu plano serão exibidos aqui.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <p className="text-2xl font-semibold">--</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Limites de usuários e módulos virão do backend.</li>
              <li>Informações reais de cobrança serão integradas depois.</li>
            </ul>
            <Button
              className="mt-1 w-full text-xs"
              onClick={() => handleMockAction("Configurar plano do workspace")}
            >
              Gerenciar plano
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Comparar planos
            </CardTitle>
            <CardDescription>
              Em breve você poderá comparar opções reais de assinatura aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <p className="text-sm text-muted-foreground">
              As faixas de preço e recursos exibidos aqui são placeholders e
              serão substituídos por dados reais quando a integração de
              billing estiver pronta.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Falar com o time
            </CardTitle>
            <CardDescription>
              Use este atalho para abrir o fluxo real de contato comercial no futuro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <p className="text-sm text-muted-foreground">
              Nenhuma condição comercial real é exibida ainda. Toda negociação
              será feita via backend ou ferramenta externa quando configurado.
            </p>
            <Button
              variant="outline"
              className="mt-1 w-full text-xs"
              onClick={() => handleMockAction("Falar com time comercial")}
            >
              Falar com time comercial
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SettingsPage;
