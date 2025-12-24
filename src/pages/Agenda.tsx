import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AgendaPage = () => {
  return (
    <main className="flex-1 px-4 pt-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-4">
        <header>
          <h1 className="text-lg font-semibold tracking-tight">Agenda</h1>
        </header>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Configuração</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[320px]" />
        </Card>
      </section>
    </main>
  );
};

export default AgendaPage;
