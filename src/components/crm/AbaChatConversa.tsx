import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Send, Loader2, RefreshCw, AlertTriangle, Paperclip, Image, FileText, Mic, X, Video, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEvolutionInstances } from '@/modules/whatsapp-v2/hooks/useEvolutionInstances';
import { useWhatsappMessages } from '@/modules/whatsapp-v2/hooks/useWhatsappMessages';
import { useSendMessage } from '@/modules/whatsapp-v2/hooks/useSendMessage';
import { WhatsappMessage, EvolutionInstanceConfig } from '@/modules/whatsapp-v2/types';
import { supabase } from '@/integrations/supabase/client';

// Media cache
const mediaCache = new Map<string, string>();

// Media loader hook
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
    
    const cached = mediaCache.get(cacheKey);
    if (cached) {
      setDataUri(cached);
      return;
    }

    fetchedRef.current = true;
    setIsLoading(true);

    (async () => {
      try {
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

// Message bubble component
interface MessageBubbleProps {
  message: WhatsappMessage;
  contactName?: string;
  instance?: EvolutionInstanceConfig | null;
}

const MessageBubble = ({ message, contactName, instance = null }: MessageBubbleProps) => {
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
          "max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm",
          isOutbound
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground border border-border/60",
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

// Attachment type
type AttachmentFile = {
  file: File;
  type: "image" | "video" | "document" | "audio";
  preview?: string;
};

// Send message box component
interface SendMessageBoxProps {
  onSend: (content: string) => Promise<boolean> | void;
  onSendMedia?: (file: File, type: string, caption?: string) => Promise<boolean> | void;
  disabled?: boolean;
  isSending?: boolean;
}

const SendMessageBox = ({ onSend, onSendMedia, disabled, isSending }: SendMessageBoxProps) => {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null, type: AttachmentFile["type"]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const preview = type === "image" ? URL.createObjectURL(file) : undefined;
    setAttachment({ file, type, preview });
  };

  const clearAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSending || disabled) return;

    if (attachment && onSendMedia) {
      const result = await onSendMedia(attachment.file, attachment.type, value.trim() || undefined);
      if (result !== false) {
        clearAttachment();
        setValue("");
      }
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) return;
    const result = await onSend(trimmed);
    if (result !== false) {
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border/60 bg-background/80 p-3">
      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
          {attachment.type === "image" && attachment.preview ? (
            <img src={attachment.preview} alt="Preview" className="h-12 w-12 rounded object-cover" />
          ) : attachment.type === "audio" ? (
            <Mic className="h-5 w-5 text-muted-foreground" />
          ) : attachment.type === "video" ? (
            <Video className="h-5 w-5 text-muted-foreground" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{attachment.file.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {(attachment.file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearAttachment}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={disabled || isSending}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
              <Image className="h-4 w-4 mr-2" />
              Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => videoInputRef.current?.click()}>
              <Video className="h-4 w-4 mr-2" />
              Vídeo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => docInputRef.current?.click()}>
              <FileText className="h-4 w-4 mr-2" />
              Documento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => audioInputRef.current?.click()}>
              <Mic className="h-4 w-4 mr-2" />
              Áudio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden file inputs */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files, "image")} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files, "video")} />
        <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip" className="hidden" onChange={(e) => handleFileSelect(e.target.files, "document")} />
        <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files, "audio")} />

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Digite uma mensagem para enviar pelo WhatsApp..."
          className="min-h-[44px] max-h-[120px] resize-none text-sm flex-1"
          disabled={disabled || isSending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={(!value.trim() && !attachment) || disabled || isSending}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};

// Main component props
interface AbaChatConversaProps {
  telefone: string;
  nomeCliente: string;
}

export const AbaChatConversa = ({ telefone, nomeCliente }: AbaChatConversaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get Evolution instances
  const { instances: evolutionInstances, isLoading: isLoadingInstances } = useEvolutionInstances();
  
  // Use first active instance
  const selectedInstance = useMemo(
    () => evolutionInstances[0] || null,
    [evolutionInstances]
  );

  // Fetch messages for this phone number
  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
    addOptimisticMessage,
  } = useWhatsappMessages({
    instance: selectedInstance,
    phoneNumber: telefone,
    enabled: !!selectedInstance && !!telefone,
  });

  // Send message hook
  const { sendMessage, sendMedia, isSending } = useSendMessage({
    instance: selectedInstance,
    onSuccess: () => {
      refetchMessages();
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!telefone) return false;
    addOptimisticMessage(content);
    return sendMessage(telefone, content);
  };

  const handleSendMedia = async (file: File, type: string, caption?: string) => {
    if (!telefone) return false;
    return sendMedia(telefone, file, type, caption);
  };

  // Loading state
  if (isLoadingInstances) {
    return (
      <Card className="h-[600px] flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
      </Card>
    );
  }

  // No instance configured
  if (!selectedInstance) {
    return (
      <Card className="h-[600px] flex flex-col items-center justify-center p-6">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">Nenhuma instância WhatsApp</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Configure uma instância da Evolution API em "WhatsApp & Comunicação" para ver as mensagens deste cliente.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{nomeCliente}</span>
          <span className="text-[11px] text-muted-foreground">{telefone}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => refetchMessages()}
          disabled={isLoadingMessages}
        >
          <RefreshCw className={cn("h-4 w-4", isLoadingMessages && "animate-spin")} />
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
        <div className="flex flex-col gap-2">
          {messagesError ? (
            <Alert variant="destructive" className="mx-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs">Erro ao carregar mensagens</AlertTitle>
              <AlertDescription className="text-xs">
                {messagesError}
              </AlertDescription>
            </Alert>
          ) : isLoadingMessages ? (
            <div className="flex items-center justify-center pt-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="pt-10 text-center text-xs text-muted-foreground">
              Nenhuma mensagem encontrada para este número.
            </p>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                contactName={nomeCliente}
                instance={selectedInstance}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Send message box */}
      <SendMessageBox
        onSend={handleSendMessage}
        onSendMedia={handleSendMedia}
        disabled={!selectedInstance || !telefone}
        isSending={isSending}
      />
    </Card>
  );
};
