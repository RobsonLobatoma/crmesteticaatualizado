import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Database,
  FileText,
  Layers2,
  MessageSquareMore,
  Settings2,
  Users2,
  Rocket,
  Briefcase,
  ClipboardList,
  PiggyBank,
  IdCard,
  ShieldCheck,
  Megaphone,
  Package,
  UserCog,
  LineChart,
  GraduationCap,
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/integrations/supabase/AuthProvider";

// Layout principal da aplicação (documentado no README):
// - wrapper: .app-layout
// - sidebar fixa: .app-sidebar (Sidebar shadcn)
// - conteúdo principal: .app-content
// - área rolável de páginas/relatórios: .content-scroll envolvendo o <Outlet />
export const AppLayout = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message ?? "Não foi possível encerrar a sessão.",
      });
      return;
    }

    toast({
      title: "Sessão encerrada",
      description: "Você saiu do Studio CRM.",
    });

    navigate("/auth", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="app-layout">
        <Sidebar
          collapsible="icon"
          className="app-sidebar border-r border-sidebar-border bg-sidebar"
        >
          <SidebarRail />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/70">
                Studio CRM
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive tooltip="Leads do dia">
                      <NavLink
                        to="/leads"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <BarChart3 />
                        <span>Leads</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dash-Diário diário de resultados">
                      <NavLink
                        to="/dash-diario"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <CalendarDays />
                        <span>Dash-Diário</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Guia rápido operacional">
                      <NavLink
                        to="/guia-rapido"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <FileText />
                        <span>Guia Rápido</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Kanbam de tarefas e leads">
                      <NavLink
                        to="/kanbam"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <Layers2 />
                        <span>Kanbam</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Banco de campanhas">
                      <NavLink
                        to="/banco-campanhas"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <Database />
                        <span>Banco de Campanhas</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Playbook de mensagens">
                      <NavLink
                        to="/playbook-mensagens"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <MessageSquareMore />
                        <span>Playbook de Mensagens</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Configurações e planos">
                      <NavLink
                        to="/configuracoes"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <Settings2 />
                        <span>Configurações</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Aulas e tutoriais">
                      <NavLink
                        to="/aulas"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <GraduationCap />
                        <span>Aulas</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/70">
                Operação da Clínica
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Comercial">
                      <NavLink
                        to="/comercial"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <Briefcase />
                        <span>Comercial</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Agenda">
                      <NavLink
                        to="/agenda-v2"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <CalendarDays />
                        <span>Agenda</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Financeiro">
                      <NavLink
                        to="/financeiro"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <PiggyBank />
                        <span>Financeiro</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Clientes">
                      <NavLink
                        to="/clientes"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <IdCard />
                        <span>Clientes</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Jurídico">
                      <NavLink
                        to="/juridico-lgpd"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <ShieldCheck />
                        <span>Jurídico</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Marketing">
                      <NavLink
                        to="/marketing-relacionamento"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <Megaphone />
                        <span>Marketing</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="WhatsApp">
                      <NavLink
                        to="/whatsapp-v2"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <MessageSquareMore />
                        <span>WhatsApp</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Estoque">
                      <NavLink
                        to="/estoque"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <Package />
                        <span>Estoque</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Colaboradores">
                      <NavLink
                        to="/pessoas-metas"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <UserCog />
                        <span>Colaboradores</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Relatórios">
                      <NavLink
                        to="/bi"
                        className="flex items-center gap-2"
                        activeClassName="data-[active=true]"
                      >
                        <LineChart />
                        <span>Relatórios</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Painel de Super admin">
                      <NavLink
                        to="/super-admin"
                        className="flex items-center justify-between gap-2 text-xs"
                        activeClassName="data-[active=true]"
                      >
                        <span className="flex items-center gap-2">
                          <Users2 className="h-4 w-4" />
                          <span>Super admin</span>
                        </span>
                        <span className="rounded-full bg-sidebar-accent px-2 text-[10px] font-medium uppercase tracking-wide text-sidebar-accent-foreground">
                          Beta
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled className="justify-between">
                      <span className="flex items-center gap-2 text-xs">
                        <Layers2 className="h-4 w-4" />
                        Planos
                      </span>
                      <span className="text-[10px] text-sidebar-foreground/70">
                        3+ usuários
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="app-content relative bg-crm-grid">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 h-72 bg-crm-grid opacity-70 mix-blend-normal"
          />

          <header className="relative z-10 border-b bg-background/80 backdrop-blur-md">
            <div className="flex h-16 w-full items-center justify-between gap-4 px-4 lg:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="mr-1 rounded-full border border-border/80 bg-background/60" />
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crm-hero text-primary-foreground shadow-soft">
                  <span className="text-sm font-semibold">CR</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">
                    Studio CRM
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    Gerencie leads, usuários e planos em um só lugar
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={handleSignOut}
                >
                  Sair
                </Button>
              </div>
            </div>
          </header>

          <div className="content-scroll relative z-10">
            <main className="flex flex-1 flex-col pb-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
