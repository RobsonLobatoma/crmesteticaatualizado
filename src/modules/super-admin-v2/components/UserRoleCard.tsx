import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockUserRole } from "../types";

interface UserRoleCardProps {
  user: MockUserRole;
  onManageRoles: (userId: string, userName: string) => void;
  onViewActivities: (userId: string, userName: string) => void;
}

export const UserRoleCard = ({
  user,
  onManageRoles,
  onViewActivities,
}: UserRoleCardProps) => {
  return (
    <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate text-sm">{user.name}</span>
          <Badge className="rounded-full text-[10px] uppercase tracking-wide">
            {user.roles.join(", ")}
          </Badge>
        </CardTitle>
        <CardDescription className="truncate text-xs">{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 pt-0 text-xs">
        <p className="max-w-[60%] text-muted-foreground">
          Atribua ou remova papéis deste usuário quando o backend estiver conectado.
        </p>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            className="rounded-full px-3 text-[11px]"
            onClick={() => onManageRoles(user.id, user.name)}
          >
            Gerenciar papéis
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full px-3 text-[11px]"
            onClick={() => onViewActivities(user.id, user.name)}
          >
            Ver atividades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
