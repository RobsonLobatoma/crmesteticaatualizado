import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { EvolutionInstanceConfig } from "./types";
import { supabase } from "@/integrations/supabase/client";

type QRCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance?: EvolutionInstanceConfig | null;
  onConnected?: () => void;
};

interface QrCodeResponse {
  base64?: string;
  code?: string;
  pairingCode?: string;
  connected?: boolean;
  message?: string;
  error?: string;
}

export const QRCodeModal = ({ open, onOpenChange, instance, onConnected }: QRCodeModalProps) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchQrCode = useCallback(async () => {
    if (!instance) return;

    setIsLoading(true);
    setError(null);
    setQrCode(null);
    setIsConnected(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Sessão expirada. Faça login novamente.");
        return;
      }

      const response = await fetch(
        `https://ulzeeekfkgdhoojbiioo.supabase.co/functions/v1/evolution-qrcode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            evolutionApiUrl: instance.evolutionApiUrl,
            evolutionApiKey: instance.evolutionApiKey,
            instanceName: instance.evolutionInstanceName,
          }),
        }
      );

      const data: QrCodeResponse = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao buscar QR Code");
        return;
      }

      if (data.connected) {
        setIsConnected(true);
        onConnected?.();
        return;
      }

      if (data.base64) {
        setQrCode(data.base64);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("QR Code não disponível");
      }
    } catch (err) {
      console.error("Error fetching QR code:", err);
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setIsLoading(false);
    }
  }, [instance, onConnected]);

  // Fetch QR code when modal opens
  useEffect(() => {
    if (open && instance) {
      fetchQrCode();
    } else {
      // Reset state when modal closes
      setQrCode(null);
      setError(null);
      setIsConnected(false);
    }
  }, [open, instance, fetchQrCode]);

  // Auto-refresh QR code every 30 seconds (QR codes expire)
  useEffect(() => {
    if (!open || !instance || isConnected || error) return;

    const interval = setInterval(() => {
      fetchQrCode();
    }, 30000);

    return () => clearInterval(interval);
  }, [open, instance, isConnected, error, fetchQrCode]);

  if (!instance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar instância WhatsApp</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl border border-dashed border-border/70 bg-surface-elevated/80 p-4">
                <Skeleton className="h-48 w-48 rounded-lg" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando QR Code...
              </div>
            </div>
          )}

          {/* Connected State */}
          {isConnected && !isLoading && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-600">Conectado!</AlertTitle>
              <AlertDescription className="text-emerald-600/80">
                A instância já está conectada ao WhatsApp.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center gap-3 w-full">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchQrCode}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          )}

          {/* QR Code Display */}
          {qrCode && !isLoading && !error && !isConnected && (
            <>
              <div className="rounded-xl border border-dashed border-border/70 bg-white p-3">
                <img
                  src={qrCode}
                  alt="QR Code para conectar WhatsApp"
                  className="h-48 w-48 rounded-lg"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground max-w-xs">
                Abra o WhatsApp &gt; Configurações &gt; Aparelhos conectados &gt;
                Conectar dispositivo e aponte para o QR Code acima.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                Atualiza automaticamente a cada 30s
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
