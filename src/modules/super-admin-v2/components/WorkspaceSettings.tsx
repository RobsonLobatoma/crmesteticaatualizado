import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SuperAdminSettingsDTO } from "../types";

interface WorkspaceSettingsProps {
  settings: SuperAdminSettingsDTO;
  onEdit: () => void;
  onViewAudit: () => void;
}

export const WorkspaceSettings = ({
  settings,
  onEdit,
  onViewAudit,
}: WorkspaceSettingsProps) => {
  return (
    <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-base">Configurações do workspace</CardTitle>
          <CardDescription>
            Definições gerais que impactam todos os módulos e usuários.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-subtle px-3 py-2">
            <p className="text-xs text-muted-foreground">Meta diária de leads</p>
            <p className="mt-1 text-xl font-semibold">
              {settings.dailyLeadsTarget || 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Aplicada no Dash-Diário</p>
          </div>
          <div className="rounded-lg bg-surface-subtle px-3 py-2">
            <p className="text-xs text-muted-foreground">Modo manutenção</p>
            <p className="mt-1 text-xl font-semibold">
              {settings.maintenanceMode ? "Ativo" : "Desativado"}
            </p>
            <p
              className={`text-[11px] ${
                settings.maintenanceMode ? "text-amber-500" : "text-emerald-500"
              }`}
            >
              {settings.maintenanceMode
                ? "Sistema em manutenção"
                : "Clientes acessando normalmente"}
            </p>
          </div>
          <div className="rounded-lg bg-surface-subtle px-3 py-2">
            <p className="text-xs text-muted-foreground">Cadastro com Google</p>
            <p className="mt-1 text-xl font-semibold">
              {settings.allowGoogleSignup ? "Ativo" : "Desativado"}
            </p>
            <p className="text-[11px] text-muted-foreground">Usado na tela de login</p>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            Apenas quem possui papel de{" "}
            <span className="font-semibold">super admin</span> consegue alterar estas
            configurações.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={onEdit}
            >
              Editar configurações
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-xs"
              onClick={onViewAudit}
            >
              Ver auditoria
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
