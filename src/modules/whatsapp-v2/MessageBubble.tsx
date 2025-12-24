import { cn } from "@/lib/utils";
import { WhatsappMessage } from "./types";

type MessageBubbleProps = {
  message: WhatsappMessage;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOutbound = message.direction === "outbound";

  return (
    <div className={cn("flex w-full text-sm", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-soft",
          isOutbound
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-surface-elevated text-foreground border border-border/60",
        )}
      >
        <p className="whitespace-pre-wrap text-[13px] leading-snug">{message.content}</p>
        <span className={cn("mt-1 block text-[10px]", isOutbound ? "text-primary-foreground/80" : "text-muted-foreground")}
        >
          {new Date(message.sentAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};
