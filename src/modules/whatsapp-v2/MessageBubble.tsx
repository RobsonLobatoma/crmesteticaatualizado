import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WhatsappMessage } from "./types";
import { Image, FileText, Mic } from "lucide-react";

type MessageBubbleProps = {
  message: WhatsappMessage;
  contactName?: string;
};

export const MessageBubble = ({ message, contactName }: MessageBubbleProps) => {
  const isOutbound = message.direction === "outbound";

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="flex flex-col gap-1">
            {message.content.startsWith("http") ? (
              <img
                src={message.content}
                alt="Imagem"
                className="max-w-[240px] rounded-lg object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center gap-2 text-[13px]">
                <Image className="h-4 w-4 shrink-0" />
                <span>{message.content || "📷 Imagem"}</span>
              </div>
            )}
          </div>
        );
      case "document":
        return (
          <div className="flex items-center gap-2 text-[13px]">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{message.content || "📄 Documento"}</span>
          </div>
        );
      case "audio":
        return (
          <div className="flex items-center gap-2 text-[13px]">
            <Mic className="h-4 w-4 shrink-0" />
            <span>{message.content || "🎤 Áudio"}</span>
          </div>
        );
      default:
        return (
          <p className="whitespace-pre-wrap text-[13px] leading-snug">{message.content}</p>
        );
    }
  };

  return (
    <div className={cn("flex w-full gap-2 text-sm", isOutbound ? "justify-end" : "justify-start")}>
      {/* Avatar for inbound messages */}
      {!isOutbound && (
        <Avatar className="h-7 w-7 shrink-0 mt-1">
          <AvatarFallback className="text-[10px] font-semibold bg-muted text-muted-foreground">
            {contactName
              ? contactName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
              : "👤"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-soft",
          isOutbound
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-surface-elevated text-foreground border border-border/60",
        )}
      >
        {renderContent()}
        <span
          className={cn(
            "mt-1 block text-[10px]",
            isOutbound ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {new Date(message.sentAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Avatar for outbound messages */}
      {isOutbound && (
        <Avatar className="h-7 w-7 shrink-0 mt-1">
          <AvatarFallback className="text-[10px] font-semibold bg-primary/20 text-primary">
            Eu
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
