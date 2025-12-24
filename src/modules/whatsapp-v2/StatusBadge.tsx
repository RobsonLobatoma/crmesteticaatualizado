import { Badge } from "@/components/ui/badge";
import { WhatsappChatStatus } from "./types";

const STATUS_LABELS: Record<WhatsappChatStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  aguardando: "Aguardando",
  convertido: "Convertido",
  perdido: "Perdido",
};


export const StatusBadge = ({ status }: { status: WhatsappChatStatus }) => {
  let className = "border-muted text-muted-foreground bg-muted/40";

  if (status === "novo") className = "border-sky-500/40 text-sky-700 dark:text-sky-300 bg-sky-500/10";
  if (status === "em_atendimento")
    className = "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10";
  if (status === "aguardando") className = "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10";
  if (status === "convertido")
    className = "border-violet-500/40 text-violet-700 dark:text-violet-300 bg-violet-500/10";
  if (status === "perdido") className = "border-destructive/60 text-destructive bg-destructive/5";

  return (
    <Badge variant="outline" className={`rounded-full px-2 text-[11px] font-medium ${className}`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
};
