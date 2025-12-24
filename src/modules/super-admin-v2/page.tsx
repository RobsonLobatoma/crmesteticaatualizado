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
import { Settings2, FileText, Eye, EyeOff, GripVertical } from "lucide-react";
import {
  appRoleSchema,
  superAdminAssignRoleSchema,
  superAdminUpdateSettingsSchema,
} from "@/backend/admin/schemas";
import { WorkspaceSettings } from "./components/WorkspaceSettings";
import { RoleManagementPolicies } from "./components/RoleManagementPolicies";
import { UserRoleCard } from "./components/UserRoleCard";
import { AppointmentFormConfigurator } from "./components/AppointmentFormConfigurator";
import { useSuperAdmin } from "./hooks/useSuperAdmin";
import { useAppointmentFormConfig } from "./hooks/useAppointmentFormConfig";
import type { AppRole, SuperAdminAssignRoleInput, SuperAdminUpdateSettingsInput } from "./types";

const SuperAdminV2MainPage = () => {
  const { toast } = useToast();
  const { users, settings, updateSettings, assignRole, isLoading } = useSuperAdmin();
  const { config: formConfig } = useAppointmentFormConfig();

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [isFormConfigOpen, setIsFormConfigOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const settingsForm = useForm<SuperAdminUpdateSettingsInput>({
    resolver: zodResolver(superAdminUpdateSettingsSchema),
    defaultValues: {
      dailyLeadsTarget: settings.dailyLeadsTarget ?? 0,
      maintenanceMode: settings.maintenanceMode,
      allowGoogleSignup: settings.allowGoogleSignup,
    },
    mode: "onChange",
  });

  const rolesForm = useForm<SuperAdminAssignRoleInput>({
    resolver: zodResolver(superAdminAssignRoleSchema),
    defaultValues: {
      userId: "",
      role: "user",
    },
  });

  const handleOpenSettingsDialog = () => {
    settingsForm.reset({
      dailyLeadsTarget: settings.dailyLeadsTarget ?? 0,
      maintenanceMode: settings.maintenanceMode,
      allowGoogleSignup: settings.allowGoogleSignup,
    });
    setIsSettingsDialogOpen(true);
  };

  const handleSubmitSettings = async (values: SuperAdminUpdateSettingsInput) => {
    await updateSettings(values);
    toast({
      title: "Configurações salvas",
      description: "As configurações globais foram atualizadas com sucesso.",
    });
    setIsSettingsDialogOpen(false);
  };

  const handleOpenRolesDialog = (userId: string, userName: string) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUserId(userId);
    rolesForm.reset({ userId, role: user?.roles[0] ?? "user" });
    setIsRolesDialogOpen(true);
    toast({
      title: "Gerenciar papéis",
      description: `Defina o papel principal de ${userName}.`,
    });
  };

  const handleSubmitRole = async (values: SuperAdminAssignRoleInput) => {
    await assignRole(values.userId, values.role as AppRole);
    toast({
      title: "Papel atualizado",
      description: "Os papéis do usuário foram atualizados (mock).",
    });
    setIsRolesDialogOpen(false);
  };

  return (
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
          settings={settings}
          onEdit={handleOpenSettingsDialog}
          onViewAudit={() =>
            toast({
              title: "Auditoria (mock)",
              description:
                "Aqui você verá o histórico de alterações quando o backend estiver conectado.",
            })
          }
        />

        <RoleManagementPolicies
          onEditPolicy={() =>
            toast({
              title: "Política de papéis (mock)",
              description:
                "A configuração detalhada de políticas será conectada ao backend em breve.",
            })
          }
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

      <section className="grid gap-4 md:grid-cols-3">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum usuário carregado ainda. Esta área será preenchida quando o backend de permissões estiver conectado.
          </p>
        ) : (
          users.map((user) => (
            <UserRoleCard
              key={user.id}
              user={user}
              onManageRoles={(userId, userName) => handleOpenRolesDialog(userId, userName)}
              onViewActivities={(userId, userName) =>
                toast({
                  title: "Atividades do usuário (mock)",
                  description: `Aqui você verá eventos e auditoria de ${userName} quando o backend estiver conectado.`,
                })
              }
            />
          ))
        )}
      </section>

      {/* Modal de configuração do formulário */}
      <AppointmentFormConfigurator
        open={isFormConfigOpen}
        onOpenChange={setIsFormConfigOpen}
      />

      {/* Dialogo de configurações globais */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar configurações globais</DialogTitle>
            <DialogDescription>
              Ajuste metas e comportamentos que impactam todos os módulos do
              workspace.
            </DialogDescription>
          </DialogHeader>

          <Form {...settingsForm}>
            <form
              onSubmit={settingsForm.handleSubmit(handleSubmitSettings)}
              className="space-y-4"
            >
              <FormField
                control={settingsForm.control}
                name="dailyLeadsTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta diária de leads</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100000}
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
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Modo manutenção</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Quando ativo, apenas administradores conseguem acessar o
                        sistema.
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
                name="allowGoogleSignup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Cadastro com Google</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Permite que novos usuários criem conta usando o Google.
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
              Defina o papel principal do usuário no workspace. Em breve isso
              será validado no backend.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mb-3 text-sm">
              <p className="font-medium">{selectedUser.name}</p>
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
                        {(["admin", "moderator", "user"] as AppRole[]).map(
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
                              <span className="capitalize">{role}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {role === "admin"
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
  );
};

export default SuperAdminV2MainPage;
