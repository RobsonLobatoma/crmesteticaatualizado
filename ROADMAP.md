# Studio CRM - Roadmap de Desenvolvimento

## 📋 Visão Geral

Este documento apresenta o planejamento estratégico para evolução do **Studio CRM**, organizado em **5 fases principais** ao longo de **6 meses**. Cada fase possui objetivos claros, tarefas específicas, recursos necessários e expectativa de duração.

**Referência**: Baseado em `README.md` do projeto.

---

## 🎯 Objetivos Estratégicos

1. **Transformar MVP em produto production-ready** (Fases 1-2)
2. **Adicionar funcionalidades avançadas de analytics e automação** (Fase 3)
3. **Otimizar performance e escalabilidade** (Fase 4)
4. **Expandir para novos mercados e plataformas** (Fase 5)

---

## 📊 Resumo Executivo

| Fase | Nome | Duração | Foco Principal | Status |
|------|------|---------|----------------|--------|
| **1** | Fundação | 2 semanas | Backend + Auth + Persistência | 🔴 Não iniciada |
| **2** | Integração | 3 semanas | WhatsApp + Tempo Real + Storage | 🔴 Não iniciada |
| **3** | Analytics | 3 semanas | Métricas + Relatórios + Automação | 🔴 Não iniciada |
| **4** | Otimização | 4 semanas | Performance + Testes + CI/CD | 🔴 Não iniciada |
| **5** | Expansão | 2-3 meses | Mobile + IA + Multi-idioma | 🔴 Não iniciada |

**Timeline total**: ~6 meses (24 semanas)

---

## 🚀 Fase 1: Fundação (Semanas 1-2)

### Objetivo
Estabelecer infraestrutura backend completa, autenticação segura e migração de dados mockados para database real.

### Tarefas

#### 1.1. Configuração do Backend (3 dias)

**Descrição**: Ativar e configurar Lovable Cloud / Supabase.

**Sub-tarefas**:
- [ ] Criar projeto no Supabase
- [ ] Configurar variáveis de ambiente (`.env`)
  ```env
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=xxx
  ```
- [ ] Instalar `@supabase/supabase-js`
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] Criar cliente Supabase (`src/lib/supabase.ts`)
- [ ] Testar conexão (query simples)

**Recursos necessários**:
- Conta Supabase (Free tier suficiente para MVP)
- 1 desenvolvedor backend/fullstack

**Critérios de aceite**:
- ✅ Conectar ao Supabase sem erros
- ✅ Query básica retorna dados

---

#### 1.2. Migração de Dados (4 dias)

**Descrição**: Criar schema de database e migrar dados mockados.

**Sub-tarefas**:

**Tabela `clientes`**:
```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  origem TEXT NOT NULL,
  status TEXT NOT NULL,
  procedimento_interesse TEXT,
  prioridade TEXT DEFAULT 'media',
  valor_estimado DECIMAL(10,2),
  data_contato TIMESTAMPTZ DEFAULT NOW(),
  data_proximo_followup TIMESTAMPTZ,
  responsavel TEXT,
  observacoes TEXT,
  tags TEXT[],
  tempo_no_status TEXT,
  taxa_conversao INTEGER DEFAULT 50,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_user ON clientes(user_id);
```

**Tabela `historico`**:
```sql
CREATE TABLE historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data TIMESTAMPTZ DEFAULT NOW(),
  responsavel TEXT NOT NULL,
  detalhes JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_historico_cliente ON historico(cliente_id);
CREATE INDEX idx_historico_data ON historico(data DESC);
```

**Tabela `mensagens`**:
```sql
CREATE TABLE mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  remetente TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data TIMESTAMPTZ DEFAULT NOW(),
  lida BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mensagens_cliente ON mensagens(cliente_id, data DESC);
```

**Migração de dados mockados**:
- [ ] Copiar dados de `mockDataCRM.ts` para SQL inserts
- [ ] Executar migrations
- [ ] Validar integridade dos dados

**Recursos necessários**:
- 1 desenvolvedor backend
- Acesso ao Supabase Dashboard

**Critérios de aceite**:
- ✅ Tabelas criadas sem erros
- ✅ Dados mockados importados
- ✅ Relações (foreign keys) funcionando

---

#### 1.3. Row Level Security (RLS) (2 dias)

**Descrição**: Implementar políticas de segurança para multi-tenancy.

**Sub-tarefas**:

**Política: Cada usuário vê apenas seus clientes**:
```sql
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clientes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clientes FOR DELETE
  USING (auth.uid() = user_id);
```

**Testar isolamento**:
- [ ] Criar 2 usuários de teste
- [ ] Usuário A não consegue ver clientes do Usuário B
- [ ] Usuário B não consegue editar clientes do Usuário A

**Recursos necessários**:
- 1 desenvolvedor backend
- Conhecimento de RLS do Supabase

**Critérios de aceite**:
- ✅ RLS ativo em todas tabelas
- ✅ Isolamento de dados validado

---

#### 1.4. Autenticação Real (3 dias)

**Descrição**: Implementar login, signup, logout e recuperação de senha.

**Sub-tarefas**:

**Página de Login** (`src/pages/auth/Login.tsx`):
```typescript
const handleLogin = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    toast({ title: "Erro ao fazer login", description: error.message });
  } else {
    navigate('/');
  }
};
```

**Página de Signup** (`src/pages/auth/Signup.tsx`):
```typescript
const handleSignup = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome: formData.nome }
    }
  });
  
  if (error) {
    toast({ title: "Erro ao criar conta", description: error.message });
  } else {
    toast({ title: "Conta criada!", description: "Verifique seu email" });
  }
};
```

**Logout Funcional**:
```typescript
const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate('/login');
};
```

**Protected Routes** (`src/App.tsx`):
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isLoading } = useSession();
  
  if (isLoading) return <LoadingSpinner />;
  if (!session) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

// Usar em rotas privadas
<Route path="/crm/painel" element={
  <ProtectedRoute>
    <Painel />
  </ProtectedRoute>
} />
```

**Google OAuth**:
- [ ] Configurar Google Cloud Console
- [ ] Adicionar redirect URI no Supabase
- [ ] Botão "Entrar com Google"

**Recursos necessários**:
- 1 desenvolvedor fullstack
- Conta Google Cloud (free tier)

**Critérios de aceite**:
- ✅ Login com email/senha funciona
- ✅ Signup cria usuário no Supabase
- ✅ Logout limpa sessão
- ✅ Rotas protegidas redirecionam para login
- ✅ Google OAuth funciona

---

#### 1.5. CRUD de Leads (2 dias)

**Descrição**: Implementar operações Create, Read, Update, Delete com backend real.

**Sub-tarefas**:

**Hook para listar clientes**:
```typescript
export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('data_criacao', { ascending: false });
      
      if (error) throw error;
      return data as ClientePotencial[];
    }
  });
};
```

**Hook para criar cliente**:
```typescript
export const useCriarCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cliente: Omit<ClientePotencial, 'id'>) => {
      const { error } = await supabase
        .from('clientes')
        .insert(cliente);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: "Cliente criado!" });
    }
  });
};
```

**Hook para atualizar status (drag & drop)**:
```typescript
export const useAtualizarStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusLead }) => {
      const { error } = await supabase
        .from('clientes')
        .update({ 
          status, 
          data_atualizacao: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
  });
};
```

**Integrar no Painel.tsx**:
- [ ] Substituir `mockClientes` por `useClientes()`
- [ ] Substituir estado local por `useAtualizarStatus()` no drag & drop
- [ ] Adicionar modal "Novo Cliente" com form

**Recursos necessários**:
- 1 desenvolvedor fullstack

**Critérios de aceite**:
- ✅ Listar clientes do Supabase
- ✅ Criar cliente salva no banco
- ✅ Drag & drop atualiza status no banco
- ✅ Deletar cliente funciona

---

### Recursos Totais da Fase 1

| Recurso | Quantidade | Custo Estimado |
|---------|------------|----------------|
| Desenvolvedor Fullstack | 1 pessoa × 2 semanas | R$ 8.000 - R$ 12.000 |
| Supabase (Free tier) | Até 500MB + 50k MAU | Gratuito |
| Google Cloud Console | OAuth setup | Gratuito |

**Total**: R$ 8.000 - R$ 12.000

---

### Critérios de Conclusão da Fase 1

- ✅ Backend conectado e funcional
- ✅ Autenticação completa (email + Google OAuth)
- ✅ Dados persistidos no banco (não mais mockados)
- ✅ RLS implementado e testado
- ✅ CRUD de leads funcional

---

## 🔗 Fase 2: Integração (Semanas 3-5)

### Objetivo
Adicionar comunicação em tempo real, integração WhatsApp, sistema de notificações e upload de arquivos.

### Tarefas

#### 2.1. Chat em Tempo Real (4 dias)

**Descrição**: Implementar chat com Supabase Realtime.

**Sub-tarefas**:

**Subscription a novas mensagens**:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('mensagens')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensagens',
        filter: `cliente_id=eq.${clienteId}` 
      },
      (payload) => {
        setMensagens(prev => [...prev, payload.new as Mensagem]);
      }
    )
    .subscribe();
  
  return () => { supabase.removeChannel(channel); };
}, [clienteId]);
```

**Indicador "Digitando..."**:
- [ ] Broadcast quando usuário digita
- [ ] Exibir "João está digitando..." em tempo real

**Upload de arquivos no chat**:
- [ ] Botão de anexo
- [ ] Upload para Supabase Storage
- [ ] Exibir preview inline (imagens)

**Recursos necessários**:
- 1 desenvolvedor fullstack
- Supabase Realtime habilitado

**Critérios de aceite**:
- ✅ Mensagens aparecem em tempo real sem refresh
- ✅ "Digitando..." funciona
- ✅ Anexos (imagens/PDFs) funcionam

---

#### 2.2. Integração WhatsApp Business API (5 dias)

**Descrição**: Conectar WhatsApp Business API para enviar/receber mensagens.

**Sub-tarefas**:

**Configuração Meta Business**:
- [ ] Criar conta Meta Business
- [ ] Configurar WhatsApp Business API
- [ ] Obter Phone Number ID e API Key
- [ ] Configurar webhook para receber mensagens

**Enviar mensagem do CRM**:
```typescript
// Edge function: send-whatsapp-message
export const sendWhatsAppMessage = async (to: string, message: string) => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        text: { body: message }
      })
    }
  );
  
  return response.json();
};
```

**Receber mensagens (webhook)**:
```typescript
// Edge function: whatsapp-webhook
export const handleWebhook = async (req: Request) => {
  const body = await req.json();
  
  const { from, text } = body.entry[0].changes[0].value.messages[0];
  
  // Salvar mensagem no Supabase
  await supabase.from('mensagens').insert({
    cliente_id: await findClienteByPhone(from),
    remetente: from,
    conteudo: text.body,
    data: new Date().toISOString()
  });
  
  return new Response('OK', { status: 200 });
};
```

**Sincronizar histórico**:
- [ ] Importar conversas antigas (primeira sincronização)
- [ ] Marcar mensagens como lidas/não lidas

**Recursos necessários**:
- 1 desenvolvedor backend
- Conta Meta Business (free tier: 1000 conversas/mês)
- WhatsApp Business API aprovado (1-3 dias)

**Critérios de aceite**:
- ✅ Enviar mensagem do CRM chega no WhatsApp do cliente
- ✅ Mensagens do cliente chegam no CRM automaticamente
- ✅ Histórico sincronizado

---

#### 2.3. Sistema de Notificações (3 dias)

**Descrição**: Notificações push (browser) e email.

**Sub-tarefas**:

**Push Notifications com Firebase**:
```typescript
// Solicitar permissão
const token = await getToken(messaging, {
  vapidKey: FIREBASE_VAPID_KEY
});

// Salvar token no Supabase
await supabase.from('user_tokens').upsert({
  user_id: userId,
  fcm_token: token
});
```

**Enviar notificação (edge function)**:
```typescript
export const sendPushNotification = async (userId: string, title: string, body: string) => {
  const { data: tokens } = await supabase
    .from('user_tokens')
    .select('fcm_token')
    .eq('user_id', userId);
  
  for (const { fcm_token } of tokens) {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: fcm_token,
        notification: { title, body }
      })
    });
  }
};
```

**Email Notifications com Resend**:
```typescript
// Edge function: send-email
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  await resend.emails.send({
    from: 'Studio CRM <noreply@studiocrm.com>',
    to,
    subject,
    html
  });
};
```

**Preferências de notificação**:
- [ ] Toggle por tipo (novo lead, mensagem, follow-up)
- [ ] Escolher canal (push, email, ambos)

**Recursos necessários**:
- 1 desenvolvedor fullstack
- Firebase Cloud Messaging (gratuito)
- Resend (free tier: 100 emails/dia) ou SendGrid

**Critérios de aceite**:
- ✅ Notificação push quando nova mensagem chega
- ✅ Email enviado quando lead convertido
- ✅ Preferências salvas por usuário

---

#### 2.4. Upload de Arquivos (2 dias)

**Descrição**: Supabase Storage para imagens, PDFs, contratos.

**Sub-tarefas**:

**Criar bucket**:
```sql
-- No Supabase Dashboard → Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('arquivos-clientes', 'arquivos-clientes', false);
```

**RLS para o bucket**:
```sql
CREATE POLICY "Users upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'arquivos-clientes' AND auth.uid() = owner);

CREATE POLICY "Users view own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'arquivos-clientes' AND auth.uid() = owner);
```

**Upload de arquivo**:
```typescript
const handleUpload = async (file: File) => {
  const filePath = `${userId}/${clienteId}/${file.name}`;
  
  const { error } = await supabase.storage
    .from('arquivos-clientes')
    .upload(filePath, file);
  
  if (error) throw error;
  
  // Salvar referência no banco
  await supabase.from('arquivos').insert({
    cliente_id: clienteId,
    nome: file.name,
    path: filePath,
    tipo: file.type,
    tamanho: file.size
  });
};
```

**Preview inline**:
- [ ] Imagens: `<img src={publicURL} />`
- [ ] PDFs: Usar `react-pdf-viewer`

**Recursos necessários**:
- 1 desenvolvedor fullstack
- Supabase Storage (free tier: 1GB)

**Critérios de aceite**:
- ✅ Upload de imagens funciona
- ✅ Upload de PDFs funciona
- ✅ Preview inline de imagens
- ✅ RLS protege arquivos de outros usuários

---

### Recursos Totais da Fase 2

| Recurso | Quantidade | Custo Estimado |
|---------|------------|----------------|
| Desenvolvedor Fullstack | 1 pessoa × 3 semanas | R$ 12.000 - R$ 18.000 |
| Meta Business (WhatsApp API) | 1000 conversas/mês | Gratuito (tier inicial) |
| Firebase Cloud Messaging | Ilimitado | Gratuito |
| Resend (emails) | 100/dia | Gratuito |

**Total**: R$ 12.000 - R$ 18.000

---

### Critérios de Conclusão da Fase 2

- ✅ Chat em tempo real funcionando
- ✅ WhatsApp integrado (envio + recebimento)
- ✅ Notificações push + email configuradas
- ✅ Upload de arquivos com RLS

---

## 📊 Fase 3: Analytics (Semanas 6-8)

### Objetivo
Dashboard analytics avançado, relatórios exportáveis e automação de follow-ups.

### Tarefas

#### 3.1. Dashboard Analytics (4 dias)

**Descrição**: Métricas e gráficos interativos com Recharts.

**Sub-tarefas**:

**Métricas principais**:
```typescript
// Taxa de conversão geral
const taxaConversao = (clientesGanhos / totalClientes) * 100;

// Taxa de conversão por origem
const conversaoPorOrigem = origens.map(origem => ({
  origem,
  taxa: (ganhos[origem] / total[origem]) * 100
}));

// Tempo médio por status
const tempoMedio = statuses.map(status => ({
  status,
  dias: calcularMediaDias(clientes.filter(c => c.status === status))
}));

// Performance por responsável
const performance = responsaveis.map(resp => ({
  nome: resp,
  leads: clientes.filter(c => c.responsavel === resp).length,
  ganhos: clientes.filter(c => c.responsavel === resp && c.status === 'ganho').length,
  receita: soma(clientes.filter(c => c.responsavel === resp && c.status === 'ganho').map(c => c.valorEstimado))
}));
```

**Gráficos**:
- [ ] Funil de conversão (Bar Chart)
- [ ] Leads por origem (Pie Chart)
- [ ] Timeline de novos leads (Line Chart)
- [ ] Performance por responsável (Bar Chart horizontal)

**Filtros**:
- [ ] Período (últimos 7 dias, 30 dias, 90 dias, custom)
- [ ] Origem
- [ ] Responsável

**Recursos necessários**:
- 1 desenvolvedor frontend
- Recharts (já instalado)

**Critérios de aceite**:
- ✅ Dashboard exibe métricas atualizadas
- ✅ Gráficos interativos (hover, tooltip)
- ✅ Filtros funcionam

---

#### 3.2. Exportação de Relatórios (3 dias)

**Descrição**: Exportar relatórios em PDF e Excel.

**Sub-tarefas**:

**Exportar PDF com jsPDF**:
```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportarPDF = () => {
  const doc = new jsPDF();
  
  doc.text('Relatório de Leads', 14, 20);
  
  autoTable(doc, {
    head: [['Nome', 'Status', 'Valor', 'Responsável']],
    body: clientes.map(c => [c.nome, c.status, `R$ ${c.valorEstimado}`, c.responsavel])
  });
  
  doc.save('relatorio-leads.pdf');
};
```

**Exportar Excel com xlsx**:
```typescript
import * as XLSX from 'xlsx';

const exportarExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(clientes);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, 'leads.xlsx');
};
```

**Filtros antes de exportar**:
- [ ] Período
- [ ] Status
- [ ] Origem
- [ ] Responsável

**Recursos necessários**:
- 1 desenvolvedor frontend
- `jspdf`, `jspdf-autotable`, `xlsx` (instalar)

**Critérios de aceite**:
- ✅ PDF gerado com tabela formatada
- ✅ Excel gerado com todas colunas
- ✅ Filtros aplicados antes de exportar

---

#### 3.3. Automação de Follow-ups (4 dias)

**Descrição**: Lembretes automáticos e templates de mensagens.

**Sub-tarefas**:

**Regras de automação**:
```typescript
// Tabela: automations
interface Automacao {
  id: string;
  nome: string;
  condicao: {
    status: StatusLead;
    diasSemInteracao: number;
  };
  acao: {
    tipo: 'enviar_email' | 'enviar_whatsapp' | 'criar_tarefa';
    template: string;
  };
  ativa: boolean;
}
```

**Exemplo**:
```typescript
// Automação: "Se lead em 'proposta' por 3 dias sem interação, enviar email"
{
  nome: 'Lembrar proposta',
  condicao: {
    status: 'proposta',
    diasSemInteracao: 3
  },
  acao: {
    tipo: 'enviar_email',
    template: 'template-lembrete-proposta'
  },
  ativa: true
}
```

**Executor (edge function rodando a cada hora)**:
```typescript
// Edge function: run-automations (cron: 0 * * * *)
export const runAutomations = async () => {
  const automacoes = await supabase.from('automations').select('*').eq('ativa', true);
  
  for (const auto of automacoes) {
    const clientes = await supabase
      .from('clientes')
      .select('*')
      .eq('status', auto.condicao.status)
      .lt('ultima_interacao', subDays(new Date(), auto.condicao.diasSemInteracao));
    
    for (const cliente of clientes) {
      if (auto.acao.tipo === 'enviar_email') {
        await sendEmail(cliente.email, 'Lembrete', renderTemplate(auto.acao.template, cliente));
      }
    }
  }
};
```

**Interface de gerenciamento**:
- [ ] Listar automações
- [ ] Criar nova automação (form)
- [ ] Ativar/desativar
- [ ] Histórico de execuções

**Recursos necessários**:
- 1 desenvolvedor backend
- Supabase Edge Functions (cron jobs)

**Critérios de aceite**:
- ✅ Automação dispara corretamente
- ✅ Email enviado no momento certo
- ✅ Histórico de execuções salvo

---

### Recursos Totais da Fase 3

| Recurso | Quantidade | Custo Estimado |
|---------|------------|----------------|
| Desenvolvedor Fullstack | 1 pessoa × 3 semanas | R$ 12.000 - R$ 18.000 |
| Bibliotecas (jspdf, xlsx) | Open source | Gratuito |

**Total**: R$ 12.000 - R$ 18.000

---

### Critérios de Conclusão da Fase 3

- ✅ Dashboard analytics completo
- ✅ Exportação PDF + Excel funciona
- ✅ Automações configuráveis e funcionando

---

## ⚡ Fase 4: Otimização (Semanas 9-12)

### Objetivo
Melhorar performance, implementar testes automatizados, configurar CI/CD e transformar em PWA.

### Tarefas

#### 4.1. Performance (5 dias)

**Descrição**: Otimizar bundle size, lazy loading e caching.

**Sub-tarefas**:

**Lazy loading de rotas**:
```typescript
import { lazy, Suspense } from 'react';

const Painel = lazy(() => import('./pages/crm/Painel'));
const ClientePotencial = lazy(() => import('./pages/crm/ClientePotencial'));

// Em App.tsx
<Route path="/crm/painel" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Painel />
  </Suspense>
} />
```

**Virtualization com @tanstack/react-virtual**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualKanban = ({ clientes }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: clientes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Altura estimada do card
  });
  
  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      {virtualizer.getVirtualItems().map(item => (
        <div key={item.key} style={{ height: item.size }}>
          <CartaoCliente cliente={clientes[item.index]} />
        </div>
      ))}
    </div>
  );
};
```

**Code splitting agressivo**:
```typescript
// Separar Recharts (biblioteca pesada)
const DashboardCharts = lazy(() => import('./components/DashboardCharts'));
```

**Compressão Brotli**:
```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress' })
  ]
});
```

**Recursos necessários**:
- 1 desenvolvedor frontend sênior
- `@tanstack/react-virtual`, `vite-plugin-compression`

**Critérios de aceite**:
- ✅ Bundle inicial < 500KB (gzipped)
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s

---

#### 4.2. PWA (Progressive Web App) (3 dias)

**Descrição**: Transformar em app instalável com offline support.

**Sub-tarefas**:

**Configurar Vite PWA**:
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Studio CRM',
        short_name: 'StudioCRM',
        description: 'Sistema de gestão para clínicas de estética',
        theme_color: '#000000',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              }
            }
          }
        ]
      }
    })
  ]
});
```

**Offline fallback**:
- [ ] Exibir "Sem conexão" quando offline
- [ ] Salvar ações em queue local
- [ ] Sincronizar quando voltar online (Background Sync API)

**Recursos necessários**:
- 1 desenvolvedor frontend
- `vite-plugin-pwa`

**Critérios de aceite**:
- ✅ App instalável (botão "Adicionar à tela inicial")
- ✅ Funciona offline (dados em cache)
- ✅ Background sync de ações offline

---

#### 4.3. Testes Automatizados (5 dias)

**Descrição**: Unit tests, integration tests, E2E tests.

**Sub-tarefas**:

**Configurar Vitest**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
```

**Testes unitários**:
```typescript
// src/components/__tests__/CartaoCliente.test.tsx
import { render, screen } from '@testing-library/react';
import { CartaoCliente } from '../CartaoCliente';

describe('CartaoCliente', () => {
  it('renderiza nome do cliente', () => {
    const cliente = { nome: 'João Silva', ... };
    render(<CartaoCliente cliente={cliente} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });
  
  it('exibe badge de prioridade alta', () => {
    const cliente = { prioridade: 'alta', ... };
    render(<CartaoCliente cliente={cliente} />);
    expect(screen.getByText('Alta')).toHaveClass('bg-red-500');
  });
});
```

**Testes E2E com Playwright**:
```typescript
// e2e/kanban.spec.ts
import { test, expect } from '@playwright/test';

test('drag & drop atualiza status', async ({ page }) => {
  await page.goto('/crm/painel');
  
  const card = page.locator('[data-testid="card-cli-001"]');
  const colunaProposta = page.locator('[data-testid="coluna-proposta"]');
  
  await card.dragTo(colunaProposta);
  
  await expect(page.locator('.toast')).toContainText('movido para Proposta');
});
```

**Cobertura de testes**:
- [ ] Componentes críticos (CartaoCliente, ColunaKanban, FiltrosKanban)
- [ ] Hooks customizados (useClientes, useCriarCliente)
- [ ] Fluxo completo E2E (login → criar lead → mover status → logout)

**Recursos necessários**:
- 1 desenvolvedor com experiência em testes
- `vitest`, `@testing-library/react`, `playwright`

**Critérios de aceite**:
- ✅ Cobertura de testes > 70%
- ✅ E2E tests passando em CI

---

#### 4.4. CI/CD (2 dias)

**Descrição**: Pipeline automatizado de deploy.

**Sub-tarefas**:

**GitHub Actions workflow**:
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install deps
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Environments**:
- `staging`: Branch `develop` → deploy para staging.studiocrm.com
- `production`: Branch `main` → deploy para studiocrm.com

**Recursos necessários**:
- 1 desenvolvedor DevOps
- Vercel (free tier ou Pro: $20/mês)

**Critérios de aceite**:
- ✅ Push para `main` dispara deploy automático
- ✅ Testes rodam antes de deploy
- ✅ Rollback automático se build falhar

---

### Recursos Totais da Fase 4

| Recurso | Quantidade | Custo Estimado |
|---------|------------|----------------|
| Desenvolvedor Fullstack Sênior | 1 pessoa × 4 semanas | R$ 16.000 - R$ 24.000 |
| Vercel Pro (opcional) | $20/mês | ~R$ 100/mês |

**Total**: R$ 16.000 - R$ 24.000 (+ R$ 100/mês Vercel)

---

### Critérios de Conclusão da Fase 4

- ✅ Performance otimizada (bundle < 500KB, FCP < 1.5s)
- ✅ PWA funcional (instalável + offline)
- ✅ Testes automatizados (> 70% cobertura)
- ✅ CI/CD configurado

---

## 🚀 Fase 5: Expansão (Meses 4-6)

### Objetivo
Expandir para mobile (React Native), adicionar IA, multi-idioma e marketplace de integrações.

### Tarefas

#### 5.1. App Mobile (React Native) (4 semanas)

**Descrição**: App nativo iOS/Android.

**Sub-tarefas**:

**Setup Expo**:
```bash
npx create-expo-app studio-crm-mobile
cd studio-crm-mobile
npm install @supabase/supabase-js react-native-url-polyfill
```

**Compartilhar código**:
- [ ] Mover lógica de negócio para `packages/shared`
- [ ] Reexportar components cross-platform

**Funcionalidades mobile**:
- [ ] Login com biometria (Face ID / Touch ID)
- [ ] Push notifications nativas
- [ ] Câmera para scanner de documentos (OCR)
- [ ] Offline-first com SQLite local

**Publicação**:
- [ ] App Store (Apple Developer: $99/ano)
- [ ] Google Play (Google Play Console: $25 one-time)

**Recursos necessários**:
- 1 desenvolvedor React Native sênior
- Apple Developer Account ($99/ano)
- Google Play Console ($25 one-time)

**Critérios de aceite**:
- ✅ App instalável em iOS e Android
- ✅ Paridade de features com web
- ✅ Publicado nas stores

---

#### 5.2. IA para Sugestão de Respostas (2 semanas)

**Descrição**: Integrar OpenAI API para sugestões contextuais.

**Sub-tarefas**:

**Edge function: gerar sugestão**:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const gerarSugestao = async (contexto: string, historicoMensagens: Mensagem[]) => {
  const prompt = `
    Você é um assistente de vendas de uma clínica de estética.
    Contexto: ${contexto}
    Histórico: ${historicoMensagens.map(m => `${m.remetente}: ${m.conteudo}`).join('\n')}
    
    Sugira uma resposta profissional e empática para o cliente.
  `;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.7
  });
  
  return completion.choices[0].message.content;
};
```

**UI**:
- [ ] Botão "Sugerir resposta" no chat
- [ ] Exibir sugestão em card editável
- [ ] "Enviar" ou "Editar" antes de enviar

**Recursos necessários**:
- 1 desenvolvedor backend
- OpenAI API (pay-as-you-go: ~$0.01 por sugestão)

**Critérios de aceite**:
- ✅ Sugestão relevante gerada em < 3s
- ✅ Usuário pode editar antes de enviar

---

#### 5.3. Multi-idioma (i18n) (1 semana)

**Descrição**: Suporte para Português, Inglês, Espanhol.

**Sub-tarefas**:

**Configurar react-i18next**:
```bash
npm install react-i18next i18next
```

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: require('./locales/pt.json') },
    en: { translation: require('./locales/en.json') },
    es: { translation: require('./locales/es.json') }
  },
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false }
});
```

**Traduzir strings**:
```json
// src/i18n/locales/pt.json
{
  "kanban.novo": "Novo",
  "kanban.qualificacao": "Qualificação",
  "kanban.proposta": "Proposta",
  "cliente.nome": "Nome",
  "cliente.telefone": "Telefone"
}
```

**Usar no componente**:
```typescript
import { useTranslation } from 'react-i18next';

const Painel = () => {
  const { t } = useTranslation();
  
  return <h1>{t('kanban.titulo')}</h1>;
};
```

**Seletor de idioma**:
- [ ] Dropdown na sidebar
- [ ] Salvar preferência no localStorage

**Recursos necessários**:
- 1 desenvolvedor frontend
- Tradutor (ou usar Google Translate API)

**Critérios de aceite**:
- ✅ App traduzido em 3 idiomas
- ✅ Troca de idioma em tempo real

---

#### 5.4. Marketplace de Integrações (3 semanas)

**Descrição**: Conectar com Google Calendar, Stripe, Zapier, etc.

**Sub-tarefas**:

**Google Calendar**:
```typescript
// Sincronizar agendamentos
export const syncGoogleCalendar = async (evento: Agendamento) => {
  await google.calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: `Consulta - ${evento.clienteNome}`,
      start: { dateTime: evento.data },
      end: { dateTime: addHours(evento.data, 1) }
    }
  });
};
```

**Stripe**:
```typescript
// Processar pagamento
import Stripe from 'stripe';
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const criarCobranca = async (clienteId: string, valor: number) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: valor * 100, // Centavos
    currency: 'brl',
    metadata: { clienteId }
  });
  
  return paymentIntent.client_secret;
};
```

**Zapier**:
- [ ] Criar Zapier app (webhook triggers)
- [ ] Trigger: "Novo lead criado"
- [ ] Trigger: "Lead convertido"

**Recursos necessários**:
- 1 desenvolvedor backend
- Contas das plataformas (Google, Stripe, Zapier)

**Critérios de aceite**:
- ✅ Agendamentos sincronizam com Google Calendar
- ✅ Pagamentos via Stripe funcionam
- ✅ Zapier triggers ativos

---

### Recursos Totais da Fase 5

| Recurso | Quantidade | Custo Estimado |
|---------|------------|----------------|
| Desenvolvedor React Native | 1 pessoa × 4 semanas | R$ 16.000 - R$ 24.000 |
| Desenvolvedor Backend | 1 pessoa × 6 semanas | R$ 24.000 - R$ 36.000 |
| Apple Developer | $99/ano | ~R$ 500/ano |
| Google Play Console | $25 one-time | ~R$ 125 |
| OpenAI API | Pay-as-you-go | ~R$ 500/mês (estimado) |

**Total**: R$ 40.000 - R$ 60.000 (+ R$ 500/ano Apple + R$ 500/mês OpenAI)

---

### Critérios de Conclusão da Fase 5

- ✅ App mobile publicado (iOS + Android)
- ✅ IA sugerindo respostas
- ✅ Multi-idioma (3 idiomas)
- ✅ Integrações com Google, Stripe, Zapier

---

## 📊 Resumo Financeiro Total

| Fase | Duração | Custo Estimado |
|------|---------|----------------|
| **Fase 1** | 2 semanas | R$ 8.000 - R$ 12.000 |
| **Fase 2** | 3 semanas | R$ 12.000 - R$ 18.000 |
| **Fase 3** | 3 semanas | R$ 12.000 - R$ 18.000 |
| **Fase 4** | 4 semanas | R$ 16.000 - R$ 24.000 |
| **Fase 5** | 10 semanas | R$ 40.000 - R$ 60.000 |

**Total**: R$ 88.000 - R$ 132.000

**Custos recorrentes**:
- Supabase: Gratuito até 500MB + 50k MAU (depois ~$25/mês)
- Vercel: Gratuito ou Pro $20/mês
- OpenAI API: ~R$ 500/mês
- Apple Developer: ~R$ 500/ano

---

## 🎯 KPIs de Sucesso

### Fase 1-2 (Produção)
- ✅ 100% dados persistidos (não mock)
- ✅ Autenticação 100% funcional
- ✅ 0 bugs críticos
- ✅ Uptime > 99.5%

### Fase 3 (Analytics)
- ✅ Dashboard carrega em < 2s
- ✅ 100% usuários usando relatórios
- ✅ Automações economizam 5h/semana por usuário

### Fase 4 (Performance)
- ✅ Lighthouse Score > 90
- ✅ Bundle < 500KB
- ✅ Cobertura de testes > 70%

### Fase 5 (Expansão)
- ✅ App mobile com 1000+ downloads (3 meses)
- ✅ IA com 90% satisfação
- ✅ 3+ integrações ativas

---

## 📅 Timeline Visual

```
Mês 1       Mês 2       Mês 3       Mês 4       Mês 5       Mês 6
│           │           │           │           │           │
├─ FASE 1 ──┤           │           │           │           │
│ Backend   │           │           │           │           │
│ + Auth    │           │           │           │           │
│           │           │           │           │           │
            ├─ FASE 2 ──┤           │           │           │
            │ WhatsApp  │           │           │           │
            │ + Realtime│           │           │           │
            │           │           │           │           │
                        ├─ FASE 3 ──┤           │           │
                        │ Analytics │           │           │
                        │           │           │           │
                                    ├─ FASE 4 ──┤           │
                                    │ Perf+PWA  │           │
                                    │           │           │
                                                ├─── FASE 5 ─┤
                                                │ Mobile+IA  │
                                                │            │
```

---

## 🚦 Próximos Passos Imediatos

1. **Aprovar este roadmap** com stakeholders
2. **Contratar equipe** (1 fullstack + 1 backend)
3. **Iniciar Fase 1** (Semana 1):
   - Dia 1-2: Setup Supabase
   - Dia 3-5: Migração de dados
   - Dia 6-7: RLS
   - Dia 8-10: Auth
4. **Review semanal** de progresso
5. **Ajustar roadmap** conforme feedback

---

**Documento criado em**: 2024-12-19  
**Versão**: 1.0.0  
**Próxima revisão**: Após conclusão de cada fase