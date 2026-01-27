import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { EvolutionInstanceConfig } from "../types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface InstanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance?: EvolutionInstanceConfig | null;
  onSubmit: (data: {
    name: string;
    evolutionApiUrl: string;
    evolutionApiKey: string;
    evolutionInstanceName: string;
  }) => Promise<boolean>;
  isSubmitting?: boolean;
}

interface TestResult {
  status: "idle" | "testing" | "success" | "error";
  message?: string;
}

export function InstanceFormModal({
  open,
  onOpenChange,
  instance,
  onSubmit,
  isSubmitting = false,
}: InstanceFormModalProps) {
  const [name, setName] = useState("");
  const [evolutionApiUrl, setEvolutionApiUrl] = useState("");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");
  const [evolutionInstanceName, setEvolutionInstanceName] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>({ status: "idle" });

  const isEditing = !!instance;

  useEffect(() => {
    if (instance) {
      setName(instance.name);
      setEvolutionApiUrl(instance.evolutionApiUrl);
      setEvolutionApiKey(instance.evolutionApiKey);
      setEvolutionInstanceName(instance.evolutionInstanceName);
    } else {
      setName("");
      setEvolutionApiUrl("");
      setEvolutionApiKey("");
      setEvolutionInstanceName("");
    }
    setShowApiKey(false);
    setTestResult({ status: "idle" });
  }, [instance, open]);

  const handleTestConnection = async () => {
    if (!evolutionApiUrl.trim() || !evolutionApiKey.trim() || !evolutionInstanceName.trim()) {
      setTestResult({
        status: "error",
        message: "Preencha todos os campos obrigatórios antes de testar.",
      });
      return;
    }

    setTestResult({ status: "testing" });

    try {
      const response = await supabase.functions.invoke("evolution-check-status", {
        body: {
          evolutionApiUrl: evolutionApiUrl.trim(),
          evolutionApiKey: evolutionApiKey.trim(),
          instanceName: evolutionInstanceName.trim(),
        },
      });

      if (response.error) {
        setTestResult({
          status: "error",
          message: response.error.message || "Erro ao testar conexão",
        });
        return;
      }

      const data = response.data;

      if (data?.error) {
        setTestResult({
          status: "error",
          message: data.error,
        });
        return;
      }

      if (data?.status === "error") {
        setTestResult({
          status: "error",
          message: data.error || "Erro desconhecido",
        });
        return;
      }

      // Connected, disconnected, or pending_qr are all valid states
      const statusMessages: Record<string, string> = {
        connected: `Conectado! ${data.profileName ? `Perfil: ${data.profileName}` : ""} ${data.phoneNumber ? `(${data.phoneNumber})` : ""}`.trim(),
        disconnected: "Conexão OK! Instância desconectada - use o QR Code para conectar.",
        pending_qr: "Conexão OK! Aguardando leitura do QR Code.",
      };

      setTestResult({
        status: "success",
        message: statusMessages[data.status] || "Conexão estabelecida com sucesso!",
      });
    } catch (err) {
      setTestResult({
        status: "error",
        message: err instanceof Error ? err.message : "Erro ao testar conexão",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await onSubmit({
      name: name.trim(),
      evolutionApiUrl: evolutionApiUrl.trim(),
      evolutionApiKey: evolutionApiKey.trim(),
      evolutionInstanceName: evolutionInstanceName.trim(),
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const isValid =
    name.trim() &&
    evolutionApiUrl.trim() &&
    evolutionApiKey.trim() &&
    evolutionInstanceName.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Instância" : "Nova Instância Evolution API"}
          </DialogTitle>
          <DialogDescription>
            Configure as credenciais da Evolution API para conectar ao WhatsApp.
            Seus dados são armazenados de forma segura no banco de dados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs text-amber-600 dark:text-amber-400">
              As credenciais são criptografadas e armazenadas no banco. Nunca
              compartilhe sua API Key com terceiros.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="name">Nome da instância</Label>
            <Input
              id="name"
              placeholder="Ex: Recepção, Comercial, Suporte"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              Nome para identificar esta conexão no sistema.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evolutionApiUrl">Evolution API URL</Label>
            <Input
              id="evolutionApiUrl"
              type="url"
              placeholder="https://sua-evolution-api.com"
              value={evolutionApiUrl}
              onChange={(e) => {
                setEvolutionApiUrl(e.target.value);
                setTestResult({ status: "idle" });
              }}
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              URL base da sua instância da Evolution API.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evolutionApiKey">API Key</Label>
            <div className="relative">
              <Input
                id="evolutionApiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="Sua chave de API"
                value={evolutionApiKey}
                onChange={(e) => {
                  setEvolutionApiKey(e.target.value);
                  setTestResult({ status: "idle" });
                }}
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Chave de autenticação gerada na Evolution API.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evolutionInstanceName">Nome da Instância (Evolution)</Label>
            <Input
              id="evolutionInstanceName"
              placeholder="Ex: instance_comercial"
              value={evolutionInstanceName}
              onChange={(e) => {
                setEvolutionInstanceName(e.target.value);
                setTestResult({ status: "idle" });
              }}
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              Nome da instância configurada na Evolution API (case-sensitive).
            </p>
          </div>

          {/* Test Connection Button */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testResult.status === "testing" || !evolutionApiUrl.trim() || !evolutionApiKey.trim() || !evolutionInstanceName.trim()}
              className="w-full"
            >
              {testResult.status === "testing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando conexão...
                </>
              ) : (
                "Testar conexão"
              )}
            </Button>

            {testResult.status === "success" && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-xs text-green-600 dark:text-green-400">
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}

            {testResult.status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEditing
                ? "Salvar alterações"
                : "Criar instância"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
