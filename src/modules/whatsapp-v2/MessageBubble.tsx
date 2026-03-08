import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WhatsappMessage, EvolutionInstanceConfig } from "./types";
import { Image, FileText, Mic, Video, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// In-memory cache to avoid re-fetching
const mediaCache = new Map<string, string>();

function useMediaLoader(
  message: WhatsappMessage,
  instance: EvolutionInstanceConfig | null,
) {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const hasMedia = message.type !== "text" && (message.mediaUrl || message.type === "audio" || message.type === "image" || message.type === "video");
  const cacheKey = message.id;

  useEffect(() => {
    if (!hasMedia || !instance || fetchedRef.current) return;
    
    // Check cache first
    const cached = mediaCache.get(cacheKey);
    if (cached) {
      setDataUri(cached);
      return;
    }

    fetchedRef.current = true;
    setIsLoading(true);

    (async () => {
      try {
        // Build remoteJid from chatId
        let remoteJid = message.chatId;
        if (!remoteJid.includes("@")) {
          remoteJid = `${remoteJid.replace(/\D/g, "")}@s.whatsapp.net`;
        }

        const response = await supabase.functions.invoke("evolution-fetch-media-base64", {
          body: {
            evolutionApiUrl: instance.evolutionApiUrl,
            evolutionApiKey: instance.evolutionApiKey,
            instanceName: instance.evolutionInstanceName,
            messageId: message.id,
            remoteJid,
            mediaUrl: message.mediaUrl,
          },
        });

        if (response.error) throw new Error(response.error.message);
        if (response.data?.error) throw new Error(response.data.error);

        const { base64, mimeType } = response.data;
        if (base64) {
          const uri = `data:${mimeType};base64,${base64}`;
          mediaCache.set(cacheKey, uri);
          setDataUri(uri);
        } else {
          setError("Sem dados");
        }
      } catch (err) {
        console.error("Media load error:", err);
        setError(err instanceof Error ? err.message : "Erro");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [hasMedia, instance, cacheKey, message.chatId, message.id, message.mediaUrl]);

  return { dataUri, isLoading, error };
}

type MessageBubbleProps = {
  message: WhatsappMessage;
  contactName?: string;
  instance?: EvolutionInstanceConfig | null;
};

export const MessageBubble = ({ message, contactName, instance = null }: MessageBubbleProps) => {
  const isOutbound = message.direction === "outbound";
  const { dataUri, isLoading: mediaLoading, error: mediaError } = useMediaLoader(message, instance);

  const renderContent = () => {
    switch (message.type) {
      case "image": {
        const imgSrc = dataUri || (message.content.startsWith("data:") ? message.content : undefined);
        return (
          <div className="flex flex-col gap-1">
            {mediaLoading ? (
              <div className="flex items-center justify-center w-[200px] h-[140px] rounded-lg bg-muted/40">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : imgSrc ? (
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
                <span>{mediaError || message.content || "📷 Imagem"}</span>
              </div>
            )}
            {message.content && message.content !== "[Imagem]" && !message.content.startsWith("http") && !message.content.startsWith("data:") && imgSrc && (
              <p className="whitespace-pre-wrap text-[13px] leading-snug mt-1">{message.content}</p>
            )}
          </div>
        );
      }
      case "video": {
        const videoSrc = dataUri;
        return (
          <div className="flex flex-col gap-1">
            {mediaLoading ? (
              <div className="flex items-center justify-center w-[240px] h-[140px] rounded-lg bg-muted/40">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : videoSrc ? (
              <video src={videoSrc} controls className="max-w-[280px] rounded-lg" preload="metadata" />
            ) : (
              <div className="flex items-center gap-2 text-[13px]">
                <Video className="h-4 w-4 shrink-0" />
                <span>{mediaError || message.content || "🎬 Vídeo"}</span>
              </div>
            )}
            {message.content && message.content !== "[Vídeo]" && !message.content.startsWith("http") && videoSrc && (
              <p className="whitespace-pre-wrap text-[13px] leading-snug mt-1">{message.content}</p>
            )}
          </div>
        );
      }
      case "document": {
        return (
          <div className="flex items-center gap-2 text-[13px]">
            <FileText className="h-4 w-4 shrink-0" />
            {mediaLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : dataUri ? (
              <a
                href={dataUri}
                download={message.content || "documento"}
                className="flex items-center gap-1.5 underline underline-offset-2 hover:opacity-80"
              >
                <span className="truncate max-w-[180px]">{message.content || "📄 Documento"}</span>
                <Download className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <span className="truncate">{mediaError || message.content || "📄 Documento"}</span>
            )}
          </div>
        );
      }
      case "audio": {
        return (
          <div className="flex flex-col gap-1">
            {mediaLoading ? (
              <div className="flex items-center gap-2 text-[13px]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando áudio...</span>
              </div>
            ) : dataUri ? (
              <audio controls preload="metadata" className="max-w-[240px] h-10">
                <source src={dataUri} />
              </audio>
            ) : (
              <div className="flex items-center gap-2 text-[13px]">
                <Mic className="h-4 w-4 shrink-0" />
                <span>{mediaError || message.content || "🎤 Áudio"}</span>
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
