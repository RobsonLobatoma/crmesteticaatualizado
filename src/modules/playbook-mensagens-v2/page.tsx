import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  protocoloData,
  sondagemData,
  fechamentoData,
  objecoesData,
  depoimentosData,
} from "./data/playbook.mock";

const PlaybookMensagensV2Page = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência.`,
      });
    });
  };

  return (
    <main className="flex-1 px-4 pt-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6 pb-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Play book de Mensagens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guia estratégico de atendimento para qualificar leads e fechar consultas
          </p>
        </header>

        {/* Painel 1: Protocolo de Atendimento */}
        <Card>
          <CardHeader>
            <CardTitle>1. Protocolo de Atendimento: Construindo Conexão e Confiança</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Etapa</TableHead>
                    <TableHead className="w-[200px]">Objetivo</TableHead>
                    <TableHead>Script/Ação Chave</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {protocoloData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.etapa}</TableCell>
                      <TableCell>{item.objetivo}</TableCell>
                      <TableCell className="text-sm">{item.script}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.script, "Script")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel 2: A Arte da Sondagem */}
        <Card>
          <CardHeader>
            <CardTitle>2. A Arte da Sondagem: Perguntas que Qualificam</CardTitle>
            <CardDescription>
              Utilize estas perguntas para preencher os campos de qualificação do seu CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Categoria</TableHead>
                    <TableHead className="w-[280px]">Pergunta/Frase Chave</TableHead>
                    <TableHead>Objetivo no CRM</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sondagemData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.categoria}</TableCell>
                      <TableCell className="text-sm">{item.pergunta}</TableCell>
                      <TableCell className="text-sm">{item.objetivo}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.pergunta, "Pergunta")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel 3: Fechamento Eficaz */}
        <Card>
          <CardHeader>
            <CardTitle>3. Fechamento Eficaz: Da Consulta ao Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Ação</TableHead>
                    <TableHead className="w-[300px]">Script/Frase Chave</TableHead>
                    <TableHead>Observação para o CRM</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fechamentoData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.acao}</TableCell>
                      <TableCell className="text-sm">{item.script}</TableCell>
                      <TableCell className="text-sm">{item.observacao}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.script, "Script")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel 4: Compreendendo e Superando Objeções */}
        <Card>
          <CardHeader>
            <CardTitle>4. Compreendendo e Superando Objeções</CardTitle>
            <CardDescription>
              A estratégia para objeções deve ser registrada no CRM para referência futura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Categoria</TableHead>
                    <TableHead className="w-[180px]">Objeção Comum</TableHead>
                    <TableHead className="w-[180px]">Estratégia de Resposta</TableHead>
                    <TableHead>Script de Exemplo</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {objecoesData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.categoria}</TableCell>
                      <TableCell className="text-sm">{item.objecaoComum}</TableCell>
                      <TableCell className="text-sm">{item.estrategia}</TableCell>
                      <TableCell className="text-sm">{item.scriptExemplo}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.scriptExemplo, "Script")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel 5: Utilizando Depoimentos (Prova Social) */}
        <Card>
          <CardHeader>
            <CardTitle>5. Utilizando Depoimentos (Prova Social)</CardTitle>
            <CardDescription>
              Use estes exemplos de depoimentos como scripts de prova social no seu CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Objeção a Superar</TableHead>
                    <TableHead>Depoimento Chave</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depoimentosData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.objecao}</TableCell>
                      <TableCell className="text-sm italic">{item.depoimento}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.depoimento, "Depoimento")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default PlaybookMensagensV2Page;
