import { FormEvent, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, Image, FileText, Mic, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AttachmentFile = {
  file: File;
  type: "image" | "video" | "document" | "audio";
  preview?: string;
};

type SendMessageBoxProps = {
  onSend: (content: string) => Promise<boolean> | void;
  onSendMedia?: (file: File, type: string, caption?: string) => Promise<boolean> | void;
  disabled?: boolean;
  isSending?: boolean;
};

export const SendMessageBox = ({ onSend, onSendMedia, disabled, isSending }: SendMessageBoxProps) => {
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

  const handleSubmit = async (event: FormEvent) => {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border/60 bg-background/80 p-2">
      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
          {attachment.type === "image" && attachment.preview ? (
            <img src={attachment.preview} alt="Preview" className="h-12 w-12 rounded object-cover" />
          ) : attachment.type === "audio" ? (
            <Mic className="h-5 w-5 text-muted-foreground" />
          ) : attachment.type === "video" ? (
            <Image className="h-5 w-5 text-muted-foreground" />
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
              <Image className="h-4 w-4 mr-2" />
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
          className="h-9 w-9 shrink-0 bg-primary text-primary-foreground shadow-soft"
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
