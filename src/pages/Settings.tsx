import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();

  const handleMockAction = (label: string) => {
    toast({
      title: label,
      description: "Aqui você poderá configurar essa área quando o backend estiver conectado.",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Configurações do workspace</h1>
            <p className="text-sm text-muted-foreground">
              Painel de super admin, gestão de administradores e planos do seu CRM.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <div>
              <CardTitle className="text-base">Painel de Super admin</CardTitle>
              <CardDescription>Resumo das permissões e da saúde da sua conta.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
              Super admin
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-subtle px-3 py-2">
                <p className="text-xs text-muted-foreground">Usuários ativos</p>
                <p className="mt-1 text-xl font-semibold">--</p>
                <p className="text-[11px] text-muted-foreground">Esse número será carregado do backend.</p>
              </div>
              <div className="rounded-lg bg-surface-subtle px-3 py-2">
                <p className="text-xs text-muted-foreground">Administradores</p>
                <p className="mt-1 text-xl font-semibold">--</p>
                <p className="text-[11px] text-muted-foreground">Total de administradores definido pelo backend.</p>
              </div>
              <div className="rounded-lg bg-surface-subtle px-3 py-2">
                <p className="text-xs text-muted-foreground">Status do workspace</p>
                <p className="mt-1 text-xl font-semibold">Indisponível</p>
                <p className="text-[11px] text-muted-foreground">Será exibido quando a conexão com o backend estiver ativa.</p>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>
                Apenas o <span className="font-semibold">super admin</span> pode alterar planos, gerir administradores e
                encerrar o workspace.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={() => handleMockAction("Área de segurança")}
              >
                Revisar segurança
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gerenciamento de administradores e usuários</CardTitle>
            <CardDescription>
              Convide novos membros, promova para admin e defina o acesso de cada pessoa no CRM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2">
              <div>
                <p className="text-xs font-medium">Administradores</p>
                <p className="text-xs text-muted-foreground">Lista de administradores será carregada do backend.</p>
              </div>
              <Button
                size="sm"
                className="rounded-full text-xs"
                onClick={() => handleMockAction("Gerenciar administradores")}
              >
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2">
              <div>
                <p className="text-xs font-medium">Usuários padrão</p>
                <p className="text-xs text-muted-foreground">Os usuários aparecerão aqui quando o backend estiver conectado.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs"
                onClick={() => handleMockAction("Gerenciar usuários")}
              >
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2">
              <div>
                <p className="text-xs font-medium">Convites pendentes</p>
                <p className="text-xs text-muted-foreground">Nenhuma informação até integrar com o backend.</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-xs"
                onClick={() => handleMockAction("Ver convites")}
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Plano atual
              <Badge className="rounded-full text-[10px] uppercase tracking-wide">Em breve</Badge>
            </CardTitle>
            <CardDescription>Os detalhes do seu plano serão exibidos aqui.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <p className="text-2xl font-semibold">--</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Limites de usuários e módulos virão do backend.</li>
              <li>Informações reais de cobrança serão integradas depois.</li>
            </ul>
            <Button
              className="mt-1 w-full text-xs"
              onClick={() => handleMockAction("Configurar plano do workspace")}
            >
              Gerenciar plano
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Comparar planos
            </CardTitle>
            <CardDescription>
              Em breve você poderá comparar opções reais de assinatura aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <p className="text-sm text-muted-foreground">
              As faixas de preço e recursos exibidos aqui são placeholders e
              serão substituídos por dados reais quando a integração de
              billing estiver pronta.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Falar com o time
            </CardTitle>
            <CardDescription>
              Use este atalho para abrir o fluxo real de contato comercial no futuro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <p className="text-sm text-muted-foreground">
              Nenhuma condição comercial real é exibida ainda. Toda negociação
              será feita via backend ou ferramenta externa quando configurado.
            </p>
            <Button
              variant="outline"
              className="mt-1 w-full text-xs"
              onClick={() => handleMockAction("Falar com time comercial")}
            >
              Falar com time comercial
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SettingsPage;
