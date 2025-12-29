import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableCard } from "@/components/dashboard/TableCard";
import { useClients, Client } from "./hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";

const ClientesV2Page = () => {
  const { clients, isLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Calcula idade a partir da data de nascimento
  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Extrai cidade do endereço (formato: "rua, num - bairro, cidade/estado")
  const extractCity = (address: string | null): string => {
    if (!address) return "-";
    const parts = address.split(",");
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1].trim();
      const cityState = lastPart.split("/");
      return cityState[0]?.trim() || "-";
    }
    return "-";
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-8 lg:px-8">
      <header className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Clientes &amp; Clínico</h1>
        <p className="text-sm text-muted-foreground">
          Visão unificada de cadastro, histórico e prontuário eletrônico dos pacientes.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
        <TableCard title="Pacientes">
          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : clients.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
            ) : (
              clients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClient(client)}
                    className={`flex w-full items-center justify-between border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 ${
                      isSelected ? "bg-primary/5" : "hover:bg-surface-elevated/70"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {extractCity(client.address)} • {client.phone || "-"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Cadastro</p>
                      <p className="font-medium text-foreground">
                        {client.created_at 
                          ? new Date(client.created_at).toLocaleDateString('pt-BR')
                          : "-"
                        }
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </TableCard>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Visão 360º do paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="text-sm font-medium">{selectedClient.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Idade</p>
                    <p className="text-sm font-medium">
                      {calculateAge(selectedClient.birth_date) 
                        ? `${calculateAge(selectedClient.birth_date)} anos`
                        : "-"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cidade</p>
                    <p className="text-sm font-medium">{extractCity(selectedClient.address)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{selectedClient.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedClient.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CPF</p>
                    <p className="text-sm font-medium">{selectedClient.cpf || "-"}</p>
                  </div>
                </div>

                <Tabs defaultValue="summary" className="mt-2">
                  <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="summary">Resumo</TabsTrigger>
                    <TabsTrigger value="history">Histórico de atendimentos</TabsTrigger>
                    <TabsTrigger value="chart">Prontuário (esqueleto)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-3 text-sm text-muted-foreground">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Endereço</p>
                        <p className="text-sm">{selectedClient.address || "Não informado"}</p>
                      </div>
                      {selectedClient.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground">Observações</p>
                          <p className="text-sm">{selectedClient.notes}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Profissional</TableHead>
                          <TableHead>Procedimento</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                            Histórico de atendimentos será integrado em breve.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="chart" className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <p>
                      Esta é apenas a estrutura do prontuário. No futuro, aqui entra a evolução clínica, fotos,
                      anexos e documentos assinados digitalmente.
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-surface-elevated/80 p-3 text-xs">
                        <p className="mb-1 font-medium text-foreground">Queixas e objetivos</p>
                        <p className="text-muted-foreground">
                          Área reservada para registrar as principais queixas do paciente e objetivos estéticos ou
                          funcionais.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-surface-elevated/80 p-3 text-xs">
                        <p className="mb-1 font-medium text-foreground">Evolução</p>
                        <p className="text-muted-foreground">
                          Linha do tempo com a evolução dos tratamentos, comparativos de fotos e anexos clínicos.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Selecione um paciente na coluna ao lado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientesV2Page;
