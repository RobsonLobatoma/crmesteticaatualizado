import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INVENTORY_KPIS, INVENTORY_LOTS, INVENTORY_MOVEMENTS, INVENTORY_PRODUCTS } from "./mock";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusPill } from "@/components/dashboard/StatusPill";

const EstoqueV2Page = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Estoque &amp; Suprimentos</h1>
        <p className="text-sm text-muted-foreground">
          Esqueleto de controle de insumos, lotes, validade e consumo por procedimento.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Itens abaixo do mínimo" value={INVENTORY_KPIS.belowMinimum} />
        <KpiCard label="Produtos perto da validade" value={INVENTORY_KPIS.nearExpiration} />
        <KpiCard label="Consumo médio mensal (itens)" value={INVENTORY_KPIS.monthlyConsumption} />
      </section>

      <Tabs defaultValue="overview" className="mt-2 flex-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="lots">Lotes &amp; validade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Itens em estoque</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVENTORY_PRODUCTS.map((product) => {
                    const belowMinimum = product.stock < product.minimum;
                    return (
                      <TableRow key={product.id} className="text-sm">
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell className="text-right">
                          {product.minimum}
                          {belowMinimum && (
                            <StatusPill label="Abaixo do mínimo" tone="danger" className="ml-2" />
                          )}
                        </TableCell>

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Movimentações recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVENTORY_MOVEMENTS.map((movement) => (
                    <TableRow key={movement.id} className="text-sm">
                      <TableCell>{movement.date}</TableCell>
                      <TableCell className="capitalize">{movement.type}</TableCell>
                      <TableCell>{movement.productName}</TableCell>
                      <TableCell className="text-right">{movement.quantity}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lots" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Lotes &amp; validade</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVENTORY_LOTS.map((lot) => (
                    <TableRow key={lot.id} className="text-sm">
                      <TableCell>{lot.productName}</TableCell>
                      <TableCell>{lot.lot}</TableCell>
                      <TableCell>{lot.expiration}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Monitorar</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EstoqueV2Page;

