import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WhatsappMessage } from "./types";
import { Image, FileText, Mic, Video, Download } from "lucide-react";

type MessageBubbleProps = {
  message: WhatsappMessage;
  contactName?: string;
};

export const MessageBubble = ({ message, contactName }: MessageBubbleProps) => {
  const isOutbound = message.direction === "outbound";

  const renderContent = () => {
    switch (message.type) {
      case "image": {
        const imgSrc = message.mediaUrl || (message.content.startsWith("http") ? message.content : undefined);
        return (
          <div className="flex flex-col gap-1">
            {imgSrc ? (
              <a href={imgSrc} target="_blank" rel="noopener noreferrer">
                <img
                  src={imgSrc}
                  alt="Imagem"
                  className="max-w-[240px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              </a>
            ) : (
              <div className="flex items-center gap-2 text-[13px]">
                <Image className="h-4 w-4 shrink-0" />
                <span>{message.content || "📷 Imagem"}</span>
              </div>
            )}
            {message.content && message.content !== "[Imagem]" && !message.content.startsWith("http") && imgSrc && (
              <p className="whitespace-pre-wrap text-[13px] leading-snug mt-1">{message.content}</p>
            )}
          </div>
        );
      }
      case "video": {
        const videoSrc = message.mediaUrl;
        return (
          <div className="flex flex-col gap-1">
            {videoSrc ? (
              <video
                src={videoSrc}
                controls
                className="max-w-[280px] rounded-lg"
                preload="metadata"
              />
            ) : (
              <div className="flex items-center gap-2 text-[13px]">
                <Video className="h-4 w-4 shrink-0" />
                <span>{message.content || "🎬 Vídeo"}</span>
              </div>
            )}
            {message.content && message.content !== "[Vídeo]" && !message.content.startsWith("http") && videoSrc && (
              <p className="whitespace-pre-wrap text-[13px] leading-snug mt-1">{message.content}</p>
            )}
          </div>
        );
      }
      case "document": {
        const docUrl = message.mediaUrl;
        return (
          <div className="flex items-center gap-2 text-[13px]">
            <FileText className="h-4 w-4 shrink-0" />
            {docUrl ? (
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 underline underline-offset-2 hover:opacity-80"
              >
                <span className="truncate max-w-[180px]">{message.content || "📄 Documento"}</span>
                <Download className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <span className="truncate">{message.content || "📄 Documento"}</span>
            )}
          </div>
        );
      }
      case "audio": {
        const audioSrc = message.mediaUrl;
        return (
          <div className="flex flex-col gap-1">
            {audioSrc ? (
              <audio controls preload="metadata" className="max-w-[240px] h-10">
                <source src={audioSrc} />
              </audio>
            ) : (
              <div className="flex items-center gap-2 text-[13px]">
                <Mic className="h-4 w-4 shrink-0" />
                <span>{message.content || "🎤 Áudio"}</span>
              </div>
            )}
          </div>
        );
      }
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
