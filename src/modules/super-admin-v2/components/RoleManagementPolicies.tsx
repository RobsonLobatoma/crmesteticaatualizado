import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoleManagementPoliciesProps {
  onEditPolicy: () => void;
}

export const RoleManagementPolicies = ({
  onEditPolicy,
}: RoleManagementPoliciesProps) => {
  return (
    <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Gestão de papéis</CardTitle>
        <CardDescription>
          Controle quem é super admin, administrador ou usuário padrão no seu CRM.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2">
          <div>
            <p className="text-xs font-medium">Política atual</p>
            <p className="text-xs text-muted-foreground">
              Apenas super admins podem promover outros usuários para admin.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs"
            onClick={onEditPolicy}
          >
            Editar política
          </Button>
        </div>

        <div className="rounded-lg bg-surface-subtle px-3 py-2 text-xs text-muted-foreground">
          <p className="font-medium">Sugestão de uso</p>
          <p className="mt-1">
            Use o papel <span className="font-semibold">admin</span> para lideranças de
            área e <span className="font-semibold">user</span> para quem apenas opera os
            módulos do dia a dia.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
