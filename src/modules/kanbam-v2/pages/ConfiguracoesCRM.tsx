import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { ConfiguracaoCRM } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';

const ConfiguracoesCRMV2Page = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ConfiguracaoCRM>({
    atendimentoAutomatico: false,
    minutosVoltarContato: 30,
    notificarNovosLeads: true,
    notificarMudancasStatus: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('configCRM');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const handleSalvar = () => {
    localStorage.setItem('configCRM', JSON.stringify(config));
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso."
    });
  };

  return (
    <div className="flex-1 px-4 pt-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/kanbam/painel">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o painel
        </Link>
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Configurações do Atendimento</CardTitle>
          <CardDescription>
            Configure as opções de automação e notificações do seu CRM
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Atendimento automático</Label>
              <p className="text-sm text-muted-foreground">
                Quando ativado, respostas automáticas serão enviadas aos novos leads
              </p>
            </div>
            <Switch
              checked={config.atendimentoAutomatico}
              onCheckedChange={(checked) =>
                setConfig(prev => ({ ...prev, atendimentoAutomatico: checked }))
              }
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Minutos sem resposta para voltar contato
            </Label>
            <p className="text-sm text-muted-foreground">
              Após este período sem resposta, o lead será movido para "Voltar contato"
            </p>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="1"
                max="1440"
                value={config.minutosVoltarContato}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    minutosVoltarContato: parseInt(e.target.value) || 30
                  }))
                }
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Notificações</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Notificar novos leads</Label>
                <p className="text-sm text-muted-foreground">
                  Receba uma notificação quando um novo lead entrar no sistema
                </p>
              </div>
              <Switch
                checked={config.notificarNovosLeads}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({ ...prev, notificarNovosLeads: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Notificar mudanças de status</Label>
                <p className="text-sm text-muted-foreground">
                  Receba uma notificação quando um lead mudar de etapa
                </p>
              </div>
              <Switch
                checked={config.notificarMudancasStatus}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({ ...prev, notificarMudancasStatus: checked }))
                }
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button onClick={handleSalvar} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Salvar configurações
          </Button>
          <Button variant="outline" asChild>
            <Link to="/kanbam/painel">Cancelar</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfiguracoesCRMV2Page;
