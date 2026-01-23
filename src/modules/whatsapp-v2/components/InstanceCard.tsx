import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SensitiveData } from "@/components/ui/SensitiveData";
import { EvolutionInstanceConfig } from "../types";
import {
  Pencil,
  Trash2,
  QrCode,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface InstanceCardProps {
  instance: EvolutionInstanceConfig;
  onEdit: (instance: EvolutionInstanceConfig) => void;
  onDelete: (id: string) => void;
  onGenerateQr: (instance: EvolutionInstanceConfig) => void;
}

export function InstanceCard({
  instance,
  onEdit,
  onDelete,
  onGenerateQr,
}: InstanceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusConfig = (status: EvolutionInstanceConfig["status"]) => {
    switch (status) {
      case "connected":
        return {
          icon: Wifi,
          label: "Conectada",
          className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
        };
      case "pending_qr":
        return {
          icon: Clock,
          label: "Aguardando QR",
          className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        };
      case "disconnected":
        return {
          icon: WifiOff,
          label: "Desconectada",
          className: "bg-muted text-muted-foreground border-border",
        };
      case "error":
        return {
          icon: AlertCircle,
          label: "Erro",
          className: "bg-destructive/10 text-destructive border-destructive/30",
        };
      default:
        return {
          icon: WifiOff,
          label: "Desconhecido",
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const statusConfig = getStatusConfig(instance.status);
  const StatusIcon = statusConfig.icon;

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return "••••••••";
    return `${key.slice(0, 4)}••••${key.slice(-4)}`;
  };

  return (
    <>
      <Card className="border-border/70 bg-surface-elevated/80">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base font-semibold">
                {instance.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{instance.evolutionInstanceName}</span>
                {instance.phoneNumber && (
                  <>
                    <span>•</span>
                    <span>{instance.phoneNumber}</span>
                  </>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 rounded-full text-[11px] ${statusConfig.className}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Details */}
          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">API URL</span>
              <a
                href={instance.evolutionApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-primary hover:underline"
              >
                {new URL(instance.evolutionApiUrl).hostname}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">API Key</span>
              <SensitiveData
                maskedValue={maskApiKey(instance.evolutionApiKey)}
                fullValue={instance.evolutionApiKey}
                label="API Key"
                size="xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onGenerateQr(instance)}
            >
              <QrCode className="mr-1 h-3.5 w-3.5" />
              Conectar QR
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(instance)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Timestamps */}
          <p className="text-[10px] text-muted-foreground">
            Atualizado em{" "}
            {new Date(instance.updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover instância?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente a instância "{instance.name}" e
              suas credenciais. Você precisará configurar novamente caso queira
              reconectar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(instance.id)}
            >
              Remover instância
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
