import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { WhatsappChat } from "./types";
import { StatusBadge } from "./StatusBadge";

type ChatListProps = {
  chats: WhatsappChat[];
  selectedChatId?: string | null;
  onSelect: (chatId: string) => void;
};

export const ChatList = ({ chats, selectedChatId, onSelect }: ChatListProps) => {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border/70 bg-surface-elevated/80">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conversas</span>
        <span className="text-xs text-muted-foreground">{chats.length} abertas</span>
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-1 p-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelect(chat.id)}
              className={cn(
                "flex w-full flex-col gap-1 rounded-lg border border-transparent bg-background/40 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/60",
                selectedChatId === chat.id && "border-primary/50 bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {chat.leadName || chat.phoneNumber}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{chat.phoneNumber}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={chat.status} />
                  {chat.unreadCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{chat.lastMessagePreview}</div>
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
