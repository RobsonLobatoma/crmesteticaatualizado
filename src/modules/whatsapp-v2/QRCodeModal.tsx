import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WhatsappInstance } from "./types";

type QRCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance?: WhatsappInstance | null;
};

export const QRCodeModal = ({ open, onOpenChange, instance }: QRCodeModalProps) => {
  if (!instance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar instância WhatsApp</DialogTitle>
        </DialogHeader>
        <Alert variant="default" className="mb-4 flex items-start gap-2 text-xs">
          <AlertCircle className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <AlertTitle>Ambiente de simulação</AlertTitle>
            <AlertDescription>
              Este QR Code é apenas ilustrativo. Em produção, ele será gerado pela API oficial da sua provedora de
              WhatsApp.
            </AlertDescription>
          </div>
        </Alert>
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl border border-dashed border-border/70 bg-surface-elevated/80 p-4">
            <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-muted">
              <span className="text-[11px] text-muted-foreground">QR Code mock</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Abra o WhatsApp &gt; Configurações &gt; Aparelhos conectados &gt; Conectar dispositivo e aponte para o QR
            Code acima.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
