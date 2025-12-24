import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Settings2, FileText, Loader2, Users, Database as DatabaseIcon } from "lucide-react";
import { z } from "zod";
import { WorkspaceSettings } from "./components/WorkspaceSettings";
import { RoleManagementPolicies } from "./components/RoleManagementPolicies";
import { UserRoleCard } from "./components/UserRoleCard";
import { AppointmentFormConfigurator } from "./components/AppointmentFormConfigurator";
import { RolePolicyEditor } from "./components/RolePolicyEditor";
import { RequireSuperAdmin } from "./components/RequireSuperAdmin";
import { MasterDataManager } from "./components/MasterDataManager";
import { useSuperAdmin, type UserWithRoles, type SuperAdminSettings } from "./hooks/useSuperAdmin";
import { useAppointmentFormConfig } from "./hooks/useAppointmentFormConfig";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

// Schema for settings form
const settingsFormSchema = z.object({
  allowPublicRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  maxSessionDuration: z.number().min(1).max(720),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Schema for role assignment
const roleFormSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["super_admin", "admin", "moderator", "user"]),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const SuperAdminV2MainPage = () => {
  const { toast } = useToast();
  const { users, settings, updateSettings, assignRole, revokeRole, isLoading, isSuperAdmin } = useSuperAdmin();
  const { config: formConfig } = useAppointmentFormConfig();

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [isFormConfigOpen, setIsFormConfigOpen] = useState(false);
  const [isPolicyEditorOpen, setIsPolicyEditorOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      allowPublicRegistration: settings.allowPublicRegistration ?? true,
      requireEmailVerification: settings.requireEmailVerification ?? false,
      maxSessionDuration: settings.maxSessionDuration ?? 24,
    },
    mode: "onChange",
  });

  const rolesForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      userId: "",
      role: "user",
    },
  });

  const handleOpenSettingsDialog = () => {
    settingsForm.reset({
      allowPublicRegistration: settings.allowPublicRegistration ?? true,
      requireEmailVerification: settings.requireEmailVerification ?? false,
      maxSessionDuration: settings.maxSessionDuration ?? 24,
    });
    setIsSettingsDialogOpen(true);
  };

  const handleSubmitSettings = async (values: SettingsFormValues) => {
    await updateSettings(values);
    setIsSettingsDialogOpen(false);
  };

  const handleOpenRolesDialog = (userId: string, userName: string) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUserId(userId);
    rolesForm.reset({ userId, role: user?.roles[0] ?? "user" });
    setIsRolesDialogOpen(true);
  };

  const handleSubmitRole = async (values: RoleFormValues) => {
    const user = users.find((u) => u.id === values.userId);
    if (!user) return;

    // Remove current role if different
    const currentRole = user.roles[0];
    if (currentRole && currentRole !== values.role && currentRole !== "user") {
      await revokeRole(values.userId, currentRole);
    }

    // Assign new role
    if (values.role !== "user") {
      await assignRole(values.userId, values.role);
    }

    setIsRolesDialogOpen(false);
  };

  // Adapter for WorkspaceSettings component
  const workspaceSettingsAdapter = {
    dailyLeadsTarget: 0,
    maintenanceMode: false,
    allowGoogleSignup: settings.allowPublicRegistration ?? true,
  };

  // Adapter for UserRoleCard
  const userToCardAdapter = (user: UserWithRoles) => ({
    id: user.id,
    name: user.display_name || user.email || "Usuário",
    email: user.email || "",
    roles: user.roles,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <RequireSuperAdmin>
      <div className="flex flex-1 flex-col gap-3 px-4 py-4 lg:px-6 overflow-hidden">
        <header className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Super admin</h1>
            <p className="text-xs text-muted-foreground">
              Configure regras globais, papéis e segurança do CRM.
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full text-[10px] uppercase tracking-wide"
          >
            Área sensível
          </Badge>
        </header>

        {/* Grid principal com 2 colunas */}
        <div className="grid flex-1 gap-3 lg:grid-cols-2 overflow-hidden">
          {/* Coluna esquerda */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <section className="grid gap-3 md:grid-cols-2 shrink-0">
              <WorkspaceSettings
                settings={workspaceSettingsAdapter}
                onEdit={handleOpenSettingsDialog}
                onViewAudit={() =>
                  toast({
                    title: "Auditoria",
                    description:
                      "O histórico de alterações será implementado em breve.",
                  })
                }
              />

              <RoleManagementPolicies
                onEditPolicy={() => setIsPolicyEditorOpen(true)}
              />
            </section>

            {/* Cards compactos */}
            <div className="grid gap-3 md:grid-cols-2 shrink-0">
              <Card className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Formulário de Agendamento</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formConfig.fields.filter((f) => f.visible).length} campos visíveis
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsFormConfigOpen(true)}>
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <DatabaseIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Dados Mestres</p>
                      <p className="text-[10px] text-muted-foreground">
                        Profissionais, salas, equipamentos
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsMasterDataOpen(true)}>
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Coluna direita - Usuários */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 shrink-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Usuários e Papéis
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto px-4 pb-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full">
                    Nenhum usuário encontrado.
                  </p>
                ) : (
                  users.map((user) => (
                    <UserRoleCard
                      key={user.id}
                      user={userToCardAdapter(user)}
                      onManageRoles={(userId, userName) => handleOpenRolesDialog(userId, userName)}
                      onViewActivities={(userId, userName) =>
                        toast({
                          title: "Atividades do usuário",
                          description: `O histórico de ${userName} será implementado em breve.`,
                        })
                      }
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modais e Dialogs (mantidos abaixo) */}

        {/* Modal de configuração do formulário */}
        <AppointmentFormConfigurator
          open={isFormConfigOpen}
          onOpenChange={setIsFormConfigOpen}
        />

        {/* Modal de políticas de papéis */}
        <RolePolicyEditor
          open={isPolicyEditorOpen}
          onOpenChange={setIsPolicyEditorOpen}
        />

        {/* Modal de dados mestres */}
        <MasterDataManager
          open={isMasterDataOpen}
          onOpenChange={setIsMasterDataOpen}
        />

        {/* Dialogo de configurações globais */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar configurações globais</DialogTitle>
              <DialogDescription>
                Ajuste configurações que impactam todos os módulos do workspace.
              </DialogDescription>
            </DialogHeader>

            <Form {...settingsForm}>
              <form
                onSubmit={settingsForm.handleSubmit(handleSubmitSettings)}
                className="space-y-4"
              >
                <FormField
                  control={settingsForm.control}
                  name="maxSessionDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração máxima da sessão (horas)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={720}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? "" : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="allowPublicRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Permitir cadastro público</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Permite que novos usuários criem conta livremente.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="requireEmailVerification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Exigir verificação de email</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Novos usuários precisam verificar o email antes de acessar.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSettingsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Salvar alterações
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialogo de gestão de papéis */}
        <Dialog open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar papéis</DialogTitle>
              <DialogDescription>
                Defina o papel principal do usuário no workspace.
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="mb-3 text-sm">
                <p className="font-medium">{selectedUser.display_name || selectedUser.email}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            )}

            <Form {...rolesForm}>
              <form
                onSubmit={rolesForm.handleSubmit(handleSubmitRole)}
                className="space-y-4"
              >
                <input type="hidden" {...rolesForm.register("userId")} />

                <FormField
                  control={rolesForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel</FormLabel>
                      <FormControl>
                        <div className="grid gap-2 text-sm">
                          {(["super_admin", "admin", "moderator", "user"] as AppRole[]).map(
                            (role) => (
                              <button
                                key={role}
                                type="button"
                                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                  field.value === role
                                    ? "border-primary bg-primary/5"
                                    : "border-border/60 bg-background"
                                }`}
                                onClick={() => field.onChange(role)}
                              >
                                <span className="capitalize">{role.replace("_", " ")}</span>
                                <span className="text-[11px] text-muted-foreground">
                                  {role === "super_admin"
                                    ? "Acesso total + configurações globais"
                                    : role === "admin"
                                      ? "Acesso total ao workspace"
                                      : role === "moderator"
                                        ? "Gestão de times e módulos"
                                        : "Uso operacional apenas"}
                                </span>
                              </button>
                            ),
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRolesDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Salvar papel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </RequireSuperAdmin>
  );
};

export default SuperAdminV2MainPage;
