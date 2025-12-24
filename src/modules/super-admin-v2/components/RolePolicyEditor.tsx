import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Info } from "lucide-react";
import { useRolePolicies } from "../hooks/useRolePolicies";

interface RolePolicyEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RolePolicyEditor({ open, onOpenChange }: RolePolicyEditorProps) {
  const { policies, isLoading, isSaving, savePolicies, togglePolicy } = useRolePolicies();
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (policyId: string) => {
    togglePolicy(policyId);
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await savePolicies(policies);
    if (success) {
      setHasChanges(false);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setHasChanges(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Políticas de Gerenciamento de Papéis
          </DialogTitle>
          <DialogDescription>
            Configure as regras de segurança para atribuição e remoção de papéis.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {policies.policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <Label htmlFor={policy.id} className="font-medium cursor-pointer">
                    {policy.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
                <Switch
                  id={policy.id}
                  checked={policy.enabled}
                  onCheckedChange={() => handleToggle(policy.id)}
                />
              </div>
            ))}

            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">
                Essas políticas são aplicadas no backend ao atribuir ou revogar papéis.
                Desativar políticas de segurança pode expor o sistema a riscos.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Políticas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
