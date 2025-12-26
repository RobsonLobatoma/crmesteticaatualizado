import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, FolderOpen, Users, Stethoscope, DoorOpen, Laptop } from "lucide-react";
import { useFormConfig } from "@/modules/agenda-v2/hooks/useFormConfig";
import { MasterDataManager } from "@/modules/super-admin-v2/components/MasterDataManager";

export function AgendaSettingsCards() {
  const [showMasterData, setShowMasterData] = useState(false);
  const { config, isLoading } = useFormConfig();

  const visibleFields = config.fields.filter(f => f.visible);
  const hiddenFields = config.fields.filter(f => !f.visible);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        {/* Card: Formulário de Agendamento */}
        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Formulário de Agendamento</CardTitle>
                <CardDescription>Campos configurados pelo administrador</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">
              Visualização
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {visibleFields.map((field) => (
                    <Badge
                      key={field.id}
                      variant="outline"
                      className="rounded-full px-3 py-1 text-xs"
                    >
                      {field.label}
                      {field.required && <span className="ml-1 text-destructive">*</span>}
                    </Badge>
                  ))}
                </div>
                {hiddenFields.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {hiddenFields.length} campo(s) oculto(s) pelo administrador
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Card: Dados Mestres do Agendamento */}
        <Card className="border-border/80 bg-surface-elevated/95 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <FolderOpen className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Dados Mestres do Agendamento</CardTitle>
                <CardDescription>Profissionais, procedimentos, salas e equipamentos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Profissionais</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span>Procedimentos</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                <span>Salas</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2">
                <Laptop className="h-4 w-4 text-muted-foreground" />
                <span>Equipamentos</span>
              </div>
            </div>
            <Button
              className="w-full rounded-full text-xs"
              onClick={() => setShowMasterData(true)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Gerenciar Dados
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Modal: Gerenciador de Dados Mestres */}
      <MasterDataManager open={showMasterData} onOpenChange={setShowMasterData} />
    </>
  );
}
