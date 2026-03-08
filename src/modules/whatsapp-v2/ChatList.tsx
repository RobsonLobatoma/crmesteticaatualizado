import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { WhatsappChat, WhatsappChatStatus } from "./types";
import { Sparkles } from "lucide-react";

type ChatListProps = {
  chats: WhatsappChat[];
  selectedChatId?: string | null;
  onSelect: (chatId: string) => void;
};

function getInitials(name?: string, phone?: string) {
  if (name && name !== phone) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }
  return phone ? phone.slice(-2) : "?";
}

const STATUS_CONFIG: Record<WhatsappChatStatus, { color: string; label: string }> = {
  novo: { color: "bg-sky-500", label: "Novo" },
  em_atendimento: { color: "bg-emerald-500", label: "Em atendimento" },
  aguardando: { color: "bg-amber-500", label: "Aguardando" },
  convertido: { color: "bg-violet-500", label: "Convertido" },
  perdido: { color: "bg-destructive", label: "Perdido" },
};

export const ChatList = ({ chats, selectedChatId, onSelect }: ChatListProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-border/70 bg-surface-elevated/80">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conversas</span>
          <span className="text-xs text-muted-foreground">{chats.length}</span>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-1 p-2">
            {chats.map((chat) => {
              const statusConf = STATUS_CONFIG[chat.status] || STATUS_CONFIG.novo;
              const isNew = chat.status === "novo";

              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelect(chat.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg border border-transparent bg-background/40 px-2 py-2 text-left text-xs transition-colors hover:bg-muted/60",
                    selectedChatId === chat.id && "border-primary/50 bg-primary/5",
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                      {getInitials(chat.leadName, chat.phoneNumber)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="flex-1 min-w-0 text-[13px] font-medium leading-tight truncate">
                        {chat.leadName || chat.phoneNumber}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        {isNew && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Sparkles className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Novo Lead</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={cn("inline-block h-2 w-2 rounded-full shrink-0", statusConf.color)} />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">{statusConf.label}</TooltipContent>
                        </Tooltip>
                        {chat.unreadCount > 0 && (
                          <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {chat.phoneNumber}
                    </span>
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                      {chat.lastMessagePreview}
                    </div>
                  </div>
                </button>
              );
            })}
            {chats.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                Nenhuma conversa aberta nesta instância.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};
