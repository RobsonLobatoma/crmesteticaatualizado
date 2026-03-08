import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { WhatsappChat } from "./types";
import { StatusBadge } from "./StatusBadge";

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

export const ChatList = ({ chats, selectedChatId, onSelect }: ChatListProps) => {
  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-border/70 bg-surface-elevated/80">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conversas</span>
        <span className="text-xs text-muted-foreground">{chats.length} abertas</span>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-1 p-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelect(chat.id)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg border border-transparent bg-background/40 px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted/60",
                selectedChatId === chat.id && "border-primary/50 bg-primary/5",
              )}
            >
              {/* Avatar */}
              <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                  {getInitials(chat.leadName, chat.phoneNumber)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium leading-tight truncate">
                    {chat.leadName || chat.phoneNumber}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <StatusBadge status={chat.status} />
                    {chat.unreadCount > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
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
          ))}
          {chats.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Nenhuma conversa aberta nesta instância.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
