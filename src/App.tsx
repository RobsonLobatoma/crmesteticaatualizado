import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/integrations/supabase/AuthProvider";
import { RequireAuth } from "@/integrations/supabase/RequireAuth";
import AuthPage from "./pages/Auth";
import AgendaPage from "./pages/Agenda";
import SuperAdminV2Page from "./modules/super-admin-v2";
import SuperAdminV2MainPage from "./modules/super-admin-v2/page";
import WhatsAppPage from "./pages/WhatsApp";
import LeadsV2Page from "./modules/leads-v2";
import GuiaRapidoV2Page from "./modules/guia-rapido-v2";
import BancoCampanhasV2Page from "./modules/banco-campanhas-v2";
import PlaybookMensagensV2Page from "./modules/playbook-mensagens-v2";
import DashDiarioV2Page from "./modules/dash-diario-v2";
import KanbamV2Page from "./modules/kanbam-v2";
import PainelV2Page from "./modules/kanbam-v2/pages/Painel";
import ClientePotencialV2Page from "./modules/kanbam-v2/pages/ClientePotencial";
import ConfiguracoesCRMV2Page from "./modules/kanbam-v2/pages/ConfiguracoesCRM";
import ComercialV2Page from "./modules/comercial-v2";
import AgendaV2Page from "./modules/agenda-v2";
import FinanceiroV2Page from "./modules/financeiro-v2";
import ClientesV2Page from "./modules/clientes-v2";
import JuridicoV2Page from "./modules/juridico-v2";
import MarketingV2Page from "./modules/marketing-v2";
import WhatsappV2Page from "./modules/whatsapp-v2";
import EstoqueV2Page from "./modules/estoque-v2";
import PessoasV2Page from "./modules/pessoas-v2";
import BiV2Page from "./modules/bi-v2";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/leads" replace />} />
              <Route path="leads" element={<LeadsV2Page />} />
              <Route path="dash-diario" element={<DashDiarioV2Page />} />
              <Route path="guia-rapido" element={<GuiaRapidoV2Page />} />
              <Route path="banco-campanhas" element={<BancoCampanhasV2Page />} />
              <Route path="playbook-mensagens" element={<PlaybookMensagensV2Page />} />
              <Route path="comercial" element={<ComercialV2Page />} />
              <Route path="agenda-v2" element={<AgendaV2Page />} />
              <Route path="financeiro" element={<FinanceiroV2Page />} />
              <Route path="clientes" element={<ClientesV2Page />} />
              <Route path="juridico-lgpd" element={<JuridicoV2Page />} />
              <Route path="marketing-relacionamento" element={<MarketingV2Page />} />
              <Route path="whatsapp-v2" element={<WhatsappV2Page />} />
              <Route path="estoque" element={<EstoqueV2Page />} />
              <Route path="pessoas-metas" element={<PessoasV2Page />} />
              <Route path="bi" element={<BiV2Page />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="super-admin" element={<SuperAdminV2Page />}>
                <Route index element={<SuperAdminV2MainPage />} />
              </Route>
              <Route path="kanbam" element={<KanbamV2Page />}>
                <Route index element={<PainelV2Page />} />
                <Route path="painel" element={<PainelV2Page />} />
                <Route path="cliente-potencial/:id" element={<ClientePotencialV2Page />} />
                <Route path="configuracoes" element={<ConfiguracoesCRMV2Page />} />
              </Route>
              <Route path="whatsapp" element={<WhatsAppPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

