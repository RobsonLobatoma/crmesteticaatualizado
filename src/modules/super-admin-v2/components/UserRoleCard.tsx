import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { MockUserRole } from "../types";

interface UserRoleCardProps {
  user: MockUserRole;
  onManageRoles: (userId: string, userName: string) => void;
  onViewActivities: (userId: string, userName: string) => void;
  onDeleteUser?: (userId: string, userName: string) => Promise<void>;
  isDeleting?: boolean;
}

export const UserRoleCard = ({
  user,
  onManageRoles,
  onViewActivities,
  onDeleteUser,
  isDeleting = false,
}: UserRoleCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    if (onDeleteUser) {
      await onDeleteUser(user.id, user.name);
      setIsDialogOpen(false);
    }
  };

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
      <CardContent className="flex flex-col gap-3 pt-0 text-xs">
        <p className="text-muted-foreground">
          Atribua ou remova papéis deste usuário quando o backend estiver conectado.
        </p>
        <div className="flex flex-wrap gap-1">
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
          
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full px-3 text-[11px]"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 h-3 w-3" />
                )}
                Remover
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover <strong>{user.name}</strong>?
                  <br /><br />
                  Esta ação é <strong>irreversível</strong> e todos os dados do usuário serão permanentemente excluídos, incluindo:
                  <ul className="mt-2 list-disc list-inside text-left">
                    <li>Perfil do usuário</li>
                    <li>Papéis atribuídos</li>
                    <li>Sessões ativas</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removendo...
                    </>
                  ) : (
                    "Sim, remover"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
