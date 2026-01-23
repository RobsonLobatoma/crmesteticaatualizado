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
import { Settings2, FileText, EyeOff, GripVertical, Loader2, Users, ShieldCheck, Database as DatabaseIcon } from "lucide-react";
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
  const { users, settings, updateSettings, assignRole, revokeRole, deleteUser, isLoading, isSuperAdmin } = useSuperAdmin();
  const { config: formConfig } = useAppointmentFormConfig();

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [isFormConfigOpen, setIsFormConfigOpen] = useState(false);
  const [isPolicyEditorOpen, setIsPolicyEditorOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

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

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeletingUserId(userId);
    await deleteUser(userId);
    setDeletingUserId(null);
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
      <div className="flex flex-1 flex-col gap-6 px-4 py-8 lg:px-8">
        <header className="flex flex-col gap-2 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Super admin</h1>
              <p className="text-sm text-muted-foreground">
                Configure regras globais, papéis de usuários e segurança avançada do seu
                CRM.
              </p>
            </div>
            <Badge
              variant="outline"
              className="rounded-full text-[10px] uppercase tracking-wide"
            >
              Área sensível
            </Badge>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
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

        {/* Seção de configuração do formulário de agendamento */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formulário de Agendamento
                  </CardTitle>
                  <CardDescription>
                    Configure os campos visíveis, ordem e obrigatoriedade do formulário de novo agendamento.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsFormConfigOpen(true)}>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Configurar Campos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formConfig.fields
                  .filter((f) => f.visible)
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <Badge
                      key={field.id}
                      variant={field.required ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      <GripVertical className="h-3 w-3" />
                      {field.label}
                      {field.required && <span className="text-[10px]">*</span>}
                    </Badge>
                  ))}
                {formConfig.fields.filter((f) => !f.visible).length > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <EyeOff className="h-3 w-3" />
                    {formConfig.fields.filter((f) => !f.visible).length} ocultos
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Seção de dados mestres */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DatabaseIcon className="h-5 w-5" />
                    Dados Mestres do Agendamento
                  </CardTitle>
                  <CardDescription>
                    Gerencie profissionais, procedimentos, salas e equipamentos disponíveis.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsMasterDataOpen(true)}>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Gerenciar Dados
                </Button>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* Lista de Usuários */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários e Papéis
              </CardTitle>
              <CardDescription>
                Gerencie os papéis dos usuários do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      onDeleteUser={handleDeleteUser}
                      isDeleting={deletingUserId === user.id}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

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
