# Studio CRM - Sistema de Gestão para Clínicas de Estética

## 📋 Visão Geral do Projeto

**Studio CRM** é um sistema completo de gestão de relacionamento com clientes (CRM) desenvolvido especificamente para clínicas de procedimentos estéticos. O objetivo principal é centralizar e otimizar a gestão de leads, funil de vendas, comunicação com clientes, métricas e campanhas de marketing.

### 🎯 Objetivo Principal

Maximizar a conversão de leads em clientes através de:
- Visualização clara do funil de vendas (Kanban)
- Gestão eficiente de comunicação (WhatsApp + Chat interno)
- Análise de métricas e performance
- Automação de follow-ups e campanhas
- Organização de agendamentos e histórico completo

### 🌟 Contexto de Criação

Criado para resolver desafios específicos de clínicas de estética:
- Alto volume de leads de múltiplos canais (Instagram, Facebook, Google, indicações)
- Necessidade de acompanhamento personalizado de cada potencial cliente
- Controle de orçamentos, propostas e conversões
- Gestão de equipe de vendas/atendimento
- Rastreabilidade completa da jornada do cliente

---

## 🏗️ Arquitetura e Estrutura de Pastas

### Hierarquia de Diretórios

```
studio-crm/
├── src/
│   ├── backend/              # Lógica de backend (preparada para integração)
│   │   ├── admin/           # Super Admin module
│   │   │   ├── routes.ts    # Rotas de auditoria e gerenciamento de roles
│   │   │   ├── schemas.ts   # Validações Zod para admin
│   │   │   └── services.ts  # Lógica de negócio (audit logs, roles)
│   │   └── auth/            # Autenticação e autorização
│   │       ├── routes.ts    # Rotas de signup, login, reset password
│   │       ├── schemas.ts   # Validações de auth
│   │       └── services.ts  # Lógica de JWT, sessions
│   │
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── crm/            # Componentes específicos do CRM
│   │   │   ├── AbaChatConversa.tsx     # Interface de chat com cliente
│   │   │   ├── AbaDados.tsx            # Formulário de dados do lead
│   │   │   ├── AbaHistorico.tsx        # Timeline de eventos
│   │   │   ├── CartaoCliente.tsx       # Card draggable do Kanban
│   │   │   ├── ColunaKanban.tsx        # Coluna drop zone
│   │   │   └── FiltrosKanban.tsx       # Sistema de filtros
│   │   ├── ui/             # Shadcn/ui components (50+ componentes)
│   │   │   ├── button.tsx, card.tsx, dialog.tsx, etc.
│   │   │   └── ...         # Componentes Radix UI + Tailwind
│   │   ├── NavLink.tsx     # Link ativo com highlight
│   │   └── ThemeToggle.tsx # Botão dark/light mode
│   │
│   ├── hooks/              # Custom React Hooks
│   │   ├── use-mobile.tsx  # Detecta mobile/desktop
│   │   └── use-toast.ts    # Hook de toast notifications
│   │
│   ├── layouts/            # Layouts principais
│   │   └── AppLayout.tsx   # Layout com sidebar + header
│   │
│   ├── lib/                # Utilitários e dados
│   │   ├── mockDataCRM.ts  # 400+ linhas de dados mockados
│   │   └── utils.ts        # cn() helper (clsx + tailwind-merge)
│   │
│   ├── pages/              # Páginas de infraestrutura e telas legadas
│   │   ├── Index.tsx                   # Home/Dashboard legacy (redireciona para /leads V2)
│   │   ├── Agenda.tsx                  # Agenda legacy (será substituída por agenda-v2)
│   │   ├── WhatsApp.tsx                # Integração WhatsApp legacy (será substituída por whatsapp-v2)
│   │   ├── Settings.tsx                # Configurações gerais
│   │   └── NotFound.tsx                # 404 page
│   │
│   ├── modules/            # Módulos de negócio V2 (rotas principais)
│   │   ├── leads-v2/                # Leads & Funil (V2)
│   │   ├── guia-rapido-v2/          # Guia Rápido & Atalhos (V2)
│   │   ├── banco-campanhas-v2/      # Banco de Campanhas (V2)
│   │   ├── playbook-mensagens-v2/   # Playbook de Mensagens (V2)
│   │   ├── dash-diario-v2/          # Dash Diário (V2)
│   │   ├── kanbam-v2/               # CRM Kanban (V2)
│   │   ├── comercial-v2/            # Comercial (V2)
│   │   ├── agenda-v2/               # Agenda (V2)
│   │   ├── financeiro-v2/           # Financeiro (V2)
│   │   ├── clientes-v2/             # Clientes (V2)
│   │   ├── juridico-v2/             # Jurídico (V2)
│   │   ├── marketing-v2/            # Marketing (V2)
│   │   ├── whatsapp-v2/             # WhatsApp (V2)
│   │   ├── estoque-v2/              # Estoque (V2)
│   │   ├── pessoas-v2/              # Colaboradores (V2)
│   │   ├── bi-v2/                   # Relatórios (V2)
│   │   └── super-admin-v2/          # Gestão de workspaces, roles e políticas (V2)
│   │
│   ├── types/              # TypeScript types e interfaces
│   │   └── crm.ts          # Tipos do módulo CRM
│   │
│   ├── App.tsx             # Componente raiz + React Router
│   ├── App.css             # Estilos globais específicos
│   ├── index.css           # Design System + Tailwind tokens
│   ├── main.tsx            # Entry point (React 18 + React Router)
│   └── vite-env.d.ts       # TypeScript declarations para Vite
│
├── public/                 # Arquivos estáticos
│   ├── robots.txt
│   ├── favicon.ico
│   └── placeholder.svg
│
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML root
├── tailwind.config.ts      # Configuração Tailwind + design tokens
├── vite.config.ts          # Configuração Vite
└── tsconfig.*.json         # TypeScript configurations
```

### Função de Cada Módulo

#### **Backend** (`src/backend/`)
Estrutura preparada para integração com Supabase/Lovable Cloud:
- **Admin**: Gerenciamento de roles (admin, manager, agent), audit logs, configurações
- **Auth**: Autenticação JWT, registro, login, recuperação de senha, sessões

#### **Components** (`src/components/`)
- **CRM**: Componentes específicos do módulo CRM (Kanban, Chat, Histórico)
- **UI**: Biblioteca de componentes Shadcn/ui (50+ componentes acessíveis e customizáveis)

#### **Pages** (`src/pages/`)
Páginas de infraestrutura e algumas telas legadas:
- **Infra**: Home/Index, Configurações, NotFound
- **Legado**: Agenda (legacy), WhatsApp (legacy) e antigas telas de CRM que estão sendo migradas para módulos V2.

#### **Modules V2** (`src/modules/*-v2`)
Módulos de negócio modernos, cada um com `index.tsx`, `page.tsx`, `types.ts` e (normalmente) `mock.ts`:
- **Operação**: `leads-v2`, `kanbam-v2`, `agenda-v2`, `whatsapp-v2`
- **Gestão**: `comercial-v2`, `financeiro-v2`, `clientes-v2`, `pessoas-v2`, `estoque-v2`, `juridico-v2`, `marketing-v2`, `bi-v2`
- **Admin**: `super-admin-v2` (gestão de workspaces, roles, políticas).

#### **Lib** (`src/lib/`)
- **mockDataCRM.ts**: Dados mockados para desenvolvimento (clientes, histórico, mensagens)
- **utils.ts**: Funções utilitárias (cn para classes CSS)

---

## 🧠 Lógica e Conceitos-Chave

### Fluxo de Dados do CRM

```
┌─────────────────┐
│  Lead criado    │ → Origem (Instagram, Facebook, Google, etc.)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Status: "novo"  │ → Aparece na coluna "Novos" do Kanban
└────────┬────────┘
         ↓
┌─────────────────┐
│ Drag & Drop     │ → Usuário arrasta card para nova coluna
└────────┬────────┘
         ↓
┌─────────────────┐
│ Status alterado │ → Estado atualizado (novo → qualificacao → proposta...)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Toast exibido   │ → "Cliente [nome] movido para [status]"
└────────┬────────┘
         ↓
┌─────────────────┐
│ Histórico       │ → Evento registrado com timestamp
│ atualizado      │    (origem, destino, responsável, data)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Cliente         │ → Visualização atualizada em tempo real
│ notificado      │    (futuro: notificação por email/WhatsApp)
└─────────────────┘
```

### Principais Types e Interfaces

#### **ClientePotencial** (`src/types/crm.ts`)

```typescript
export interface ClientePotencial {
  id: string;                    // UUID único
  nome: string;                  // Nome completo
  telefone: string;              // WhatsApp principal
  email: string;                 // Email de contato
  origem: OrigemLead;            // Canal de entrada
  status: StatusLead;            // Estágio atual no funil
  procedimentoInteresse: string; // Procedimento desejado
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  valorEstimado: number;         // Valor do orçamento (R$)
  dataContato: string;           // ISO date primeira interação
  dataProximoFollowup?: string;  // ISO date próxima ação
  responsavel: string;           // Nome do atendente
  observacoes: string;           // Notas internas
  tags: string[];                // Tags customizáveis
  historicoInteracoes: string[]; // IDs de eventos
  ultimaInteracao: string;       // ISO date última ação
  tempoNoStatus: string;         // Texto legível (ex: "2 dias")
  taxaConversao: number;         // % probabilidade (0-100)
  dataCriacao: string;           // ISO date criação do lead
  dataAtualizacao: string;       // ISO date última modificação
}
```

#### **StatusLead**

```typescript
export type StatusLead = 
  | 'novo'           // Lead recém-criado, aguardando primeiro contato
  | 'qualificacao'   // Em processo de qualificação (BANT)
  | 'proposta'       // Orçamento enviado, aguardando decisão
  | 'negociacao'     // Em negociação de valores/condições
  | 'ganho'          // Convertido em cliente (fechou)
  | 'perdido'        // Não converteu (perdeu ou desistiu)
  | 'followup';      // Aguardando retorno do cliente
```

#### **EventoHistorico** (`src/types/crm.ts`)

```typescript
export interface EventoHistorico {
  id: string;                    // UUID único do evento
  clienteId: string;             // ID do cliente relacionado
  tipo: TipoEvento;              // Categoria do evento
  descricao: string;             // Descrição legível
  data: string;                  // ISO date do evento
  responsavel: string;           // Usuário que executou a ação
  detalhes?: {                   // Metadados adicionais
    statusAnterior?: string;     // Para mudanças de status
    statusNovo?: string;         // Para mudanças de status
    nomeCliente?: string;        // Nome do cliente
    tituloColuna?: string;       // Título da coluna destino
    valor?: number;              // Para eventos financeiros
    procedimento?: string;       // Para eventos de serviços
    canal?: string;              // Para eventos de comunicação
  };
}

export type TipoEvento = 
  | 'status_alterado'      // Mudança de coluna no Kanban
  | 'contato'              // Ligação, email, WhatsApp
  | 'observacao'           // Nota interna adicionada
  | 'proposta_enviada'     // Orçamento enviado
  | 'followup_agendado'    // Lembrete criado
  | 'ganho'                // Convertido em cliente
  | 'perdido';             // Lead perdido
```

### Componentes Críticos

#### **ColunaKanban** (`src/components/crm/ColunaKanban.tsx`)

**Função**: Coluna drop zone para drag & drop de cards.

**Lógica principal**:
```typescript
const { setNodeRef, isOver } = useDroppable({
  id: coluna.id,  // ID único da coluna
  data: { accepts: 'cliente' }  // Tipo aceito
});

// Renderiza:
// - Header com título e badge de contagem
// - Container drop zone (ref)
// - Lista de CartaoCliente filtrados por status
// - Visual feedback quando isOver (borda highlight)
```

**Props**:
- `coluna`: { id, titulo, cor }
- `clientes`: Array de ClientePotencial
- `onClienteClick`: Handler para abrir detalhes

#### **CartaoCliente** (`src/components/crm/CartaoCliente.tsx`)

**Função**: Card individual draggable de um lead.

**Lógica principal**:
```typescript
const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  id: cliente.id,
  data: { cliente }  // Payload carregado durante drag
});

// Renderiza:
// - Nome e telefone
// - Badges: prioridade, valor estimado, procedimento
// - Tag de origem (Instagram, Facebook, etc)
// - Ícone de tempo no status (⏱️)
// - Responsável
```

**Estados visuais**:
- Normal: Opacidade 100%, cursor grab
- Dragging: Opacidade 50%, z-index alto
- Hover: Borda accent, shadow

#### **FiltrosKanban** (`src/components/crm/FiltrosKanban.tsx`)

**Função**: Sistema de filtros em tempo real para o Kanban.

**Filtros disponíveis**:
1. **Busca por texto**: Nome, telefone, email (case-insensitive)
2. **Origem**: Instagram, Facebook, Google, Indicação, WhatsApp, Site
3. **Prioridade**: Baixa, Média, Alta, Urgente
4. **Responsável**: Dropdown dinâmico baseado nos leads
5. **Valor estimado**: Range slider (R$ 0 - R$ 50.000)

**Lógica de aplicação**:
```typescript
// Em Painel.tsx
const clientesFiltrados = clientesPorStatus.filter(cliente => {
  // 1. Busca por texto
  if (busca && !matchBusca(cliente, busca)) return false;
  
  // 2. Origem
  if (filtroOrigem.length && !filtroOrigem.includes(cliente.origem)) return false;
  
  // 3. Prioridade
  if (filtroPrioridade.length && !filtroPrioridade.includes(cliente.prioridade)) return false;
  
  // 4. Responsável
  if (filtroResponsavel && cliente.responsavel !== filtroResponsavel) return false;
  
  // 5. Valor
  if (cliente.valorEstimado < filtroValor[0] || cliente.valorEstimado > filtroValor[1]) return false;
  
  return true;
});
```

#### **AbaHistorico** (`src/components/crm/AbaHistorico.tsx`)

**Função**: Timeline visual de todos eventos de um cliente.

**Lógica de exibição**:
```typescript
// 1. Filtra eventos do cliente
const eventosCliente = mockHistorico.filter(e => e.clienteId === cliente.id);

// 2. Ordena por data (mais recente primeiro)
const eventosOrdenados = [...eventosCliente].sort((a, b) => 
  new Date(b.data).getTime() - new Date(a.data).getTime()
);

// 3. Renderiza timeline com ícones e cores dinâmicas
getIconeEvento(tipo):
  - 'status_alterado' → ArrowRightLeft
  - 'contato' → Phone
  - 'observacao' → FileText
  - 'proposta_enviada' → Send
  - 'followup_agendado' → Calendar
  - 'ganho' → CheckCircle
  - 'perdido' → XCircle

getCorEvento(tipo):
  - 'ganho' → verde
  - 'perdido' → vermelho
  - 'proposta_enviada' → azul
  - 'status_alterado' → amarelo
  - default → cinza
```

**UI**:
- Timeline vertical com linha conectora
- Ícone circular colorido para cada evento
- Timestamp relativo (formatDistance)
- Detalhes expandidos (statusAnterior → statusNovo)

### Decisões de Arquitetura

#### 1. **Mock Data vs Backend Real**

**Estado atual**: A maior parte dos módulos ainda usa dados mockados em memória, mas **Leads V2** e **Dash-Diário V2** já estão integrados a um banco **Supabase real** (tabela `public.leads`).

- **Legado**: `src/lib/mockDataCRM.ts` concentra os mocks do antigo módulo CRM (Kanban tradicional, histórico, mensagens).
- **Módulos V2 com mock**: Cada módulo possui seu próprio arquivo de mock, por exemplo:
  - `src/modules/comercial-v2/mock.ts`
  - `src/modules/financeiro-v2/mock.ts`
  - `src/modules/whatsapp-v2/mock.ts`
  - `src/modules/dash-diario-v2/mock.ts`
- **Módulos V2 com backend real (Supabase)**:
  - `src/modules/leads-v2` (CRUD de leads na tabela `leads` via Supabase)
  - `src/modules/dash-diario-v2` (indicadores diários calculados em cima da tabela `leads`)

**Padrão geral**:
```typescript
// Exemplo simplificado
export const COMMERCIAL_KPIS = [...];
export const COMMERCIAL_DAILY_VOLUME = [...];

// Funções auxiliares (quando necessário)
export function buildCommercialSummary(...) { /* ... */ }
```

**Migração futura** (mantida igual, mas agora aplicada aos módulos V2):
```typescript
// Substituir mocks por hooks que falam com o backend (Lovable Cloud)
const { data: clientes } = useQuery({
  queryKey: ['clientes'],
  queryFn: () => api.clientes.listar()
});
```

**Migração futura**:
```typescript
// Substituir por hooks do Supabase
const { data: clientes } = useQuery({
  queryKey: ['clientes'],
  queryFn: () => supabase.from('clientes').select('*')
});
```

#### 2. **Drag & Drop com @dnd-kit**

**Escolha**: @dnd-kit/core em vez de react-beautiful-dnd.

**Razão**:
- Mais moderno e mantido ativamente
- Melhor performance (usa CSS transforms)
- Acessibilidade built-in (keyboard navigation)
- Menor bundle size

**Configuração**:
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }  // Evita drag acidental em cliques
  })
);
```

#### 3. **Toast Notifications**

**Biblioteca**: Sonner (via Shadcn/ui).

**Implementação**:
```typescript
// Em Painel.tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Após mudança de status
toast({
  title: "Status atualizado",
  description: `${cliente.nome} movido para ${obterTituloStatus(novoStatus)}`,
});
```

**Por que Sonner**:
- UI bonita e customizável
- Suporta dark mode automaticamente
- Tipos TypeScript completos
- Fácil posicionamento e timing

#### 4. **Design System**

**Abordagem**: CSS variables (HSL) + Tailwind tokens.

**Estrutura** (`src/index.css`):
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

**Benefícios**:
- Dark mode automático (basta alternar classe `dark`)
- Consistência total de cores
- Fácil manutenção (um lugar para mudar tudo)
- Type-safe via Tailwind

#### 5. **Layout principal (AppLayout + Sidebar)**

O layout principal usa uma combinação de classes globais para isolar o scroll do conteúdo e manter a sidebar fixa:

- `.app-layout`: wrapper geral da aplicação (flex, ocupa a tela inteira, sem scroll global)
- `.app-sidebar`: sidebar fixa na esquerda
- `.app-content`: área principal de conteúdo, com header + conteúdo rolável
- `.content-scroll`: região onde o scroll horizontal/vertical acontece (ex.: tabelas largas, dashboards)

**Trecho simplificado de `src/index.css`:**

```css
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* evita scroll global em html/body */
}

.app-sidebar {
  width: 280px; /* largura fixa da sidebar */
  flex-shrink: 0;
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* conteúdo controla o próprio scroll */
}

.content-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
}

.content-scroll > * {
  min-width: max-content; /* evita quebra de dashboards e tabelas largas */
}
```

Na prática, `AppLayout` monta essa estrutura envolvendo o `Outlet` do React Router dentro de `.app-content` e `.content-scroll`, garantindo que apenas o conteúdo principal role, enquanto a sidebar permanece fixa.

#### 5. **Histórico com Tracking Automático**

**Função**: `adicionarEventoHistorico()` em `mockDataCRM.ts`.

**Lógica**:
```typescript
export const adicionarEventoHistorico = (
  evento: Omit<EventoHistorico, 'id' | 'data'>
) => {
  const novoEvento: EventoHistorico = {
    ...evento,
    id: `evt-${Date.now()}-${Math.random()}`,  // UUID temporário
    data: new Date().toISOString(),
  };
  
  mockHistorico.unshift(novoEvento);  // Adiciona no início (mais recente primeiro)
};
```

**Uso**:
```typescript
// Em Painel.tsx após drag & drop
adicionarEventoHistorico({
  clienteId: cliente.id,
  tipo: 'status_alterado',
  descricao: `Status alterado de ${statusAnterior} para ${novoStatus}`,
  responsavel: 'Sistema',
  detalhes: {
    statusAnterior,
    statusNovo: novoStatus,
    nomeCliente: cliente.nome,
    tituloColuna: obterTituloStatus(novoStatus)
  }
});
```

---

## ⚙️ Tecnologias e Dependências

### Frontend Core

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 18.3.1 | Biblioteca UI (hooks, suspense, concurrent mode) |
| **TypeScript** | 5.8.3 | Type safety, autocomplete, refactoring seguro |
| **Vite** | 5.4.19 | Build tool (HMR instantâneo, fast refresh) |
| **React Router DOM** | 6.30.1 | Roteamento SPA (BrowserRouter, Link, Navigate) |

### UI Framework

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Shadcn/ui** | - | Biblioteca de componentes (Radix UI + Tailwind) |
| **Lucide React** | 0.462.0 | Ícones SVG tree-shakeable (1000+ ícones) |
| **next-themes** | 0.3.0 | Dark mode (salva preferência no localStorage) |

### Componentes UI (Radix UI)

50+ componentes acessíveis (ARIA compliant):
- Accordion, Alert Dialog, Avatar, Badge, Button
- Calendar, Card, Checkbox, Collapsible, Command
- Context Menu, Dialog, Drawer, Dropdown Menu
- Form, Hover Card, Input, Label, Menubar
- Navigation Menu, Popover, Progress, Radio Group
- Scroll Area, Select, Separator, Sheet, Sidebar
- Skeleton, Slider, Switch, Table, Tabs
- Textarea, Toast, Toggle, Tooltip

### Funcionalidades Específicas

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **@dnd-kit/core** | 6.3.1 | Drag & drop (core) |
| **@dnd-kit/sortable** | 10.0.0 | Listas ordenáveis |
| **@dnd-kit/utilities** | 3.2.2 | Helpers de drag & drop |
| **TanStack React Query** | 5.83.0 | Data fetching, cache, sync (preparado para backend) |
| **React Hook Form** | 7.61.1 | Formulários performáticos (menos re-renders) |
| **Zod** | 3.25.76 | Validação de schemas (runtime + TypeScript) |
| **date-fns** | 3.6.0 | Manipulação de datas (formatDistance, parseISO) |
| **Recharts** | 2.15.4 | Gráficos responsivos (Line, Bar, Pie) |
| **Sonner** | 1.7.4 | Toast notifications elegantes |

### Utilitários

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **clsx** | 2.1.1 | Conditional classnames |
| **tailwind-merge** | 2.6.0 | Merge de classes Tailwind (evita conflitos) |
| **class-variance-authority** | 0.7.1 | Criação de componentes com variantes |

### Versões Recomendadas de Runtime

- **Node.js**: 18.x LTS ou 20.x LTS
- **npm**: 9.x ou superior
- **Alternativa**: Bun 1.1.x (mais rápido que npm)

---

## 🚀 Execução do Projeto

### Instalação

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd studio-crm

# 2. Instale as dependências
npm install
# ou com bun (mais rápido)
bun install

# 3. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev

# 4. Acesse no navegador
# http://localhost:8080
```

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev na porta 8080 (HMR ativo)

# Build
npm run build            # Build de produção (minificado, tree-shaken)
npm run build:dev        # Build em modo development (source maps completos)

# Preview
npm run preview          # Preview do build de produção

# Linting
npm run lint             # Roda ESLint em todo o projeto
```

### Variáveis de Ambiente

**Arquivo**: `.env` (criar na raiz do projeto)

```env
# Supabase (quando ativado)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# WhatsApp Business API (futuro)
VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
VITE_WHATSAPP_PHONE_ID=your_phone_number_id

# Configurações opcionais
VITE_API_BASE_URL=https://api.studicrm.com
VITE_ENV=development
```

**Importante**: Variáveis com prefixo `VITE_` são expostas no frontend (não colocar secrets sensíveis).

## 🗄️ Integração com Supabase (Banco de Dados Real)

Este projeto está integrado a um projeto **Supabase** que funciona como backend principal para **Leads V2** e **Dash-Diário V2**. A tabela `public.leads` é a **fonte única de verdade** para todos os leads e para os cálculos do Dash Diário.

### Tabela `public.leads`

```text
public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Campos principais do lead
  data text,
  responsavel text,
  nome text not null,
  contato text not null,
  origem text,
  procedimento text,
  status text not null default 'Novo lead',
  data_entrada text,
  data_ultimo_contato text,
  data_agendamento text,
  data_avaliacao text,
  compareceu text,
  data_fechamento text,
  valor_fechado text,
  observacao text
)
```

- Toda a estrutura acima está versionada em `supabase/migrations/20251223130700_88ca1299-08f9-49fb-8305-b61d7358ae63.sql`.
- O frontend usa `src/integrations/supabase/client.ts` e `src/modules/leads-v2/services/leads.service.ts` para fazer CRUD nessa tabela.

### Row-Level Security (RLS) em `public.leads`

A tabela `public.leads` possui RLS habilitado com políticas que garantem que **cada usuário veja apenas seus próprios leads**:

```sql
alter table public.leads enable row level security;

create policy "Leads are viewable by owner" 
  on public.leads
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Leads are insertable by owner" 
  on public.leads
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Leads are updatable by owner" 
  on public.leads
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Leads are deletable by owner" 
  on public.leads
  for delete
  to authenticated
  using (auth.uid() = user_id);
```

> **Importante**: Para que as policies funcionem, o usuário precisa estar autenticado no Supabase (auth.uid()).

### Função e Trigger de `updated_at`

```sql
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.update_updated_at_column();
```

Essa função/trigger garante que `updated_at` seja sempre atualizado automaticamente em qualquer UPDATE.

### Migrations do Banco de Dados

Toda a estrutura do banco (tabelas, funções, triggers, RLS) está versionada no diretório `supabase/migrations/`.

Para recriar o banco em outro projeto Supabase:

1. Crie um novo projeto no Supabase.
2. Acesse **SQL Editor** no dashboard.
3. Copie o conteúdo dos arquivos em `supabase/migrations/*.sql` (em especial `20251223130700_88ca1299-08f9-49fb-8305-b61d7358ae63.sql`).
4. Cole e execute na ordem cronológica dos arquivos.
5. Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no novo ambiente.

## 📊 Regras de Cálculo – Dash Diário V2

O módulo `dash-diario-v2` consome os dados da tabela `public.leads` para montar o painel diário de performance.

Principais regras implementadas:

- **"Fechamentos HOJE"**
  - Conta apenas leads cujo `status` atual indica fechamento (contém `"fech"`, ex.: "Fechou", "Fechado").
  - `data_fechamento` precisa cair dentro do dia correspondente à linha do dashboard.
  - Se o lead for rebaixado de status depois, ele deixa de ser contado para aquele dia.

- **"R$ Fechado HOJE"**
  - Soma somente `valor_fechado` dos leads considerados em **Fechamentos HOJE**.
  - Atualiza automaticamente quando o status ou o valor do lead é alterado.

- **Modal "Ver leads" (detalhamento do dia)**
  - Divide os leads do dia em:
    - **Leads fechados** (mostram coluna "R$ Fechado" individual).
    - **Outros leads do dia**.
  - Possui filtros de **Status**, **Responsável** e **Origem** que afetam ambas as listas simultaneamente.

## 🧭 Roadmap Técnico: Migração de Módulos para Supabase

Este roadmap descreve como migrar, de forma previsível e padronizada, os módulos ainda baseados em dados mockados (clientes, financeiro, marketing, etc.) para o Supabase, **reutilizando o modelo já implementado em `leads-v2`**.

### 1. Padrão de Arquitetura (modelo `leads-v2`)

Cada módulo que for migrado deve seguir três camadas bem definidas:

1. **Tabela no Supabase** (`public.<nome_tabela>`)
   - Colunas que refletem o contrato de dados definido em `types.ts` do módulo.
   - Colunas de auditoria (`created_at`, `updated_at`) utilizando a função `public.update_updated_at_column()`.
   - Coluna `user_id uuid not null` para isolar os dados por usuário/tenant.
   - RLS padronizada com `auth.uid() = user_id` para SELECT/INSERT/UPDATE/DELETE.

2. **Serviço de acesso aos dados** (ex.: `src/modules/<modulo>-v2/services/<modulo>.service.ts`)
   - Usa `supabase.from('<nome_tabela>')` para todas as operações de leitura e escrita.
   - Expõe métodos como `getAll`, `getById`, `create`, `update`, `delete`.
   - Implementa uma função de mapeamento `mapRowTo<Entidade>()` para traduzir `Row` → tipo de domínio (`Cliente`, `LancamentoFinanceiro`, etc.).

3. **Hooks de dados + Camada de UI**
   - Hooks React (ex.: `use<Modulo>()`, `use<ModuloFilters>()`, `use<ModuloMetrics>()`) encapsulando React Query.
   - Componentes de página e UI (`page.tsx`, tabelas, gráficos, cards) consomem apenas esses hooks, sem acessar Supabase diretamente.

### 2. Passo a Passo por Módulo

Para cada módulo (`clientes-v2`, `financeiro-v2`, `marketing-v2`, etc.), recomenda-se o seguinte fluxo:

1. **Analisar o modelo atual de domínio**
   - Abrir `src/modules/<modulo>-v2/types.ts` e listar todos os campos necessários.
   - Identificar chaves de negócio e relacionamentos (ex.: `clienteId`, `procedimentoId`, `lancamentoId`).

2. **Criar a tabela correspondente no Supabase (migration)**
   - Criar uma nova migration em `supabase/migrations/<timestamp>_<modulo>.sql` com:
     - Definição da tabela `public.<nome_tabela>` baseada em `types.ts` (tipos simples: `text`, `numeric`, `timestamptz`, etc.).
     - Coluna `user_id uuid not null`.
     - Ativação de RLS e criação de policies seguindo o padrão da tabela `leads`.
     - Trigger de `updated_at` usando `public.update_updated_at_column()`.

3. **Implementar o serviço de acesso**
   - Criar `src/modules/<modulo>-v2/services/<modulo>.service.ts` inspirado em `src/modules/leads-v2/services/leads.service.ts`:
     - Reutilizar o mesmo padrão de tratamento de erros.
     - Manter a responsabilidade de conversão de tipos centralizada em `mapRowTo<Entidade>()`.

4. **Criar ou adaptar hooks de dados**
   - Em `src/modules/<modulo>-v2/hooks/`, criar hooks como:
     - `use<Modulo>()` → leitura principal/paginação.
     - `use<ModuloById>()` → leitura de item individual.
     - `use<ModuloMetrics>()` → agregações e KPIs.
   - Utilizar React Query para estados de carregamento, erro e cache.

5. **Substituir o mock pela fonte de dados real**
   - Atualizar `page.tsx` e demais componentes para consumirem os novos hooks.
   - Remover o uso direto de `mock.ts` da camada de UI, mantendo o mesmo comportamento funcional.

6. **Testar e validar regras de segurança**
   - Exercitar os fluxos principais (listagem, criação, edição, exclusão).
   - Garantir que as policies de RLS com `user_id` estejam corretas (cada usuário só vê os próprios registros).

### 3. Prioridade Sugerida de Migração

1. **Clientes (`clientes-v2`)**
   - Base dos cadastros e do relacionamento com o funil de vendas.
   - Possibilita cruzar informações entre `leads`, agenda e histórico de atendimentos.

2. **Financeiro (`financeiro-v2`)**
   - Permite aproximar os indicadores financeiros do Dash Diário de dados contábeis reais.
   - Abre caminho para relatórios de receita, ticket médio e inadimplência.

3. **Marketing / Banco de Campanhas / Playbook**
   - Persistência de campanhas, templates de mensagens e resultados de disparos.
   - Facilita análise de performance por canal e por campanha.

4. **Pessoas / Metas (`pessoas-v2`)**
   - Registro de metas por colaborador/equipe.
   - Suporte a dashboards de performance individual e comparativos.

5. **Demais módulos (Jurídico, Estoque, BI específico, etc.)**
   - Migração gradual, seguindo a mesma arquitetura, conforme necessidade de produção.

### 4. Boas Práticas Gerais

- Manter **RLS sempre habilitada**, usando o padrão `auth.uid() = user_id` para operações básicas.
- Evitar lógica complexa diretamente em policies; preferir funções `security definer` quando precisar consultar outras tabelas.
- Documentar cada nova tabela e migration neste README à medida que forem criadas.
- Reutilizar o padrão do `LeadsService` para manter consistência e reduzir curva de aprendizado entre módulos.

## 🧩 Uso em Outra IDE / Plataforma

1. **Repositório**
   - Conecte este projeto ao GitHub via Lovable (GitHub → Connect to GitHub → Create Repository).
   - Em qualquer IDE/plataforma, faça `git clone` normalmente.

2. **Frontend**
   - Instale dependências (`npm install` ou `bun install`).
   - Configure as variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.) conforme o provedor (Vercel, Render, Docker, etc.).

3. **Banco de dados**
   - Crie um projeto Supabase.
   - Rode as migrations em `supabase/migrations/*.sql` no SQL Editor para criar a estrutura.
   - Opcional: use o mesmo projeto Supabase atual apenas copiando as chaves para o novo ambiente.

4. **Rotas principais ligadas ao Supabase**
   - `/leads` → módulo `leads-v2` (CRUD de leads na tabela `public.leads`).
   - `/dash-diario` → módulo `dash-diario-v2` (indicadores diários em cima da mesma tabela).

### Configuração do Vite

**Arquivo**: `vite.config.ts`

```typescript
export default defineConfig({
  server: { 
    host: "::", 
    port: 8080 
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Permite imports "@/components/..."
    },
    // CRÍTICO: Evita múltiplas instâncias de React (resolve warnings)
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    force: true  // Força re-bundle de deps (útil quando cache corrompe)
  },
});
```

### Estrutura de Rotas

**Definidas em**: `src/App.tsx`

```typescript
<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<Navigate to="/leads" replace />} />

    {/* Painéis e atalhos */}
    <Route path="leads" element={<LeadsV2Page />} />
    <Route path="dash-diario" element={<DashDiarioV2Page />} />
    <Route path="guia-rapido" element={<GuiaRapidoV2Page />} />
    <Route path="banco-campanhas" element={<BancoCampanhasV2Page />} />
    <Route path="playbook-mensagens" element={<PlaybookMensagensV2Page />} />

    {/* Operação da clínica */}
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

    {/* Configurações e administração */}
    <Route path="configuracoes" element={<SettingsPage />} />
    <Route path="super-admin" element={<SuperAdminV2Page />} />

    {/* Rotas legadas ainda disponíveis */}
    <Route path="kanbam" element={<KanbamV2Page />} />
    <Route path="whatsapp" element={<WhatsAppPage />} />
  </Route>

  {/* Catch-all */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

**Navegação ativa**: Usar `NavLink` de `src/components/NavLink.tsx` (aplica classe `active` automaticamente).

---

## 🐛 Relatório de Bugs e Limitações

### Bugs Conhecidos

#### 1. **Warning: Function components cannot be given refs**

**Localização**: `src/components/crm/ColunaKanban.tsx`

**Erro**:
```
Warning: Function components cannot be given refs. Attempts to access this ref will fail. 
Did you mean to use React.forwardRef()?
```

**Severidade**: ⚠️ Baixa (não afeta funcionalidade)

**Causa**: 
- `useDroppable()` do @dnd-kit tenta passar `ref` para componente funcional
- Componente não usa `forwardRef()` para receber a ref

**Impacto**: 
- Gera warning no console do navegador
- Drag & drop funciona perfeitamente
- Não afeta UX nem performance

**Solução proposta**:
```typescript
// Opção 1: Wrap com forwardRef
export const ColunaKanban = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { setNodeRef, isOver } = useDroppable({...});
  
  return <div ref={ref}>...</div>;
});

// Opção 2: Ajustar estrutura do drop zone
const DivDroppable = (props: any) => {
  const { setNodeRef } = useDroppable({...});
  return <div ref={setNodeRef} {...props} />;
};
```

**Status**: 🟡 Funcional, mas gera warning

---

#### 2. **ScrollBar horizontal removida em componentes Radix**

**Localização**: `src/components/crm/AbaChatConversa.tsx`, `AbaHistorico.tsx`

**Comportamento**: 
- ScrollArea do Radix UI sem scrollbar visível
- Scroll funciona via trackpad/mouse wheel, mas não há indicador visual

**Severidade**: ⚠️ Baixa

**Causa**: 
- Scrollbar do Radix removida para UI mais limpa
- Pode dificultar navegação em telas pequenas ou para usuários sem trackpad

**Impacto**:
- Usuários podem não perceber que há mais conteúdo abaixo
- Acessibilidade reduzida

**Solução proposta**:
```typescript
// Implementar scroll indicators customizados
<ScrollArea className="h-full">
  <ScrollBar orientation="vertical" className="w-2 bg-border hover:bg-border/80" />
  {/* conteúdo */}
</ScrollArea>
```

**Status**: 🟡 Funcional com workaround (scroll wheel)

---

### Limitações Atuais

#### 1. **Dados Mock em Memória (parcial)**

**Problema**: A maioria dos módulos ainda usa dados mockados em memória (sem persistência), **com exceção** de `leads-v2` e `dash-diario-v2`, que já utilizam Supabase (`public.leads`) como fonte de dados real.

**Impacto**: 
- Parte importante da operação (leads + dash diário) já pode ser testada com dados reais
- Outros módulos ainda não são persistentes
- Demonstrações completas ainda exigem cuidado com quais telas usar

**Solução**: Migrar gradualmente os demais módulos (clientes, financeiro, marketing, etc.) para Supabase, seguindo o mesmo padrão de `leads-v2` (tabela dedicada + RLS).

**Prioridade**: 🔴 Alta

---

#### 2. **Sem Autenticação Real**

**Problema**: 
- Botão "Sair" apenas mostra toast
- Não há login/logout funcional
- Todos usuários veem os mesmos dados

**Impacto**:
- Multi-tenancy impossível
- Segurança zero
- Não pode ser colocado em produção

**Solução**: Implementar auth com Supabase (email/password, Google OAuth).

**Prioridade**: 🔴 Alta

---

#### 3. **Chat Não Persiste**

**Problema**: 
- Mensagens são mockadas
- Enviar mensagem não salva em lugar nenhum
- Não há tempo real (WebSocket)

**Impacto**:
- Funcionalidade de chat é apenas visual
- Usuários não conseguem se comunicar de verdade

**Solução**: Integrar Supabase Realtime + tabela de mensagens.

**Prioridade**: 🟠 Média

---

#### 4. **Sem Integração WhatsApp**

**Problema**: 
- Página WhatsApp existe mas é apenas placeholder
- Não há envio/recebimento real de mensagens

**Impacto**:
- Principal canal de comunicação de clínicas não funciona
- Usuários precisam usar WhatsApp fora do sistema

**Solução**: Integrar WhatsApp Business API (Meta).

**Prioridade**: 🟠 Média

---

#### 5. **Sem Backend Real**

**Problema**: 
- Rotas definidas em `src/backend/` mas não conectadas
- Não há edge functions
- Não há validação server-side

**Impacto**:
- Segurança comprometida (validação só no frontend)
- Lógica de negócio exposta
- Performance ruim (tudo no cliente)

**Solução**: Implementar edge functions no Supabase.

**Prioridade**: 🔴 Alta

---

### Desafios Técnicos Superados

#### ✅ 1. **Conflito de TooltipProvider Duplicado**

**Problema**: 
```
Warning: Detected multiple renderers concurrently rendering the same context provider.
```

**Causa**: 
- `TooltipProvider` declarado em `App.tsx` e também em componentes filhos
- Radix UI não suporta providers aninhados do mesmo tipo

**Solução**:
- Removido `TooltipProvider` de componentes individuais
- Mantido apenas um provider global em `App.tsx`

**Status**: ✅ Resolvido

---

#### ✅ 2. **Corrupted Vite Cache**

**Problema**: 
```
Failed to resolve import "@/components/ui/tooltip" from "src/..."
```

**Causa**: 
- Cache do Vite corrompido após múltiplas mudanças rápidas
- Node_modules desatualizado

**Solução**:
```bash
rm -rf node_modules .vite
npm install
```

**Prevenção**: 
- Configurado `dedupe: ['react', 'react-dom']` no Vite
- Adicionado `optimizeDeps: { force: true }`

**Status**: ✅ Resolvido

---

#### ✅ 3. **Otimização de Cards Kanban**

**Problema**: 
- Cards muito densos (muita informação)
- Difícil escanear visualmente

**Solução**:
- Reduzido espaçamento interno em 20-25%
- Removido informações redundantes
- Melhorado hierarquia visual com cores e ícones

**Resultado**: 
- Mais cards visíveis por coluna
- Melhor usabilidade

**Status**: ✅ Resolvido

---

#### ✅ 4. **Sistema de Histórico com Tracking Automático**

**Desafio**: 
- Rastrear todas mudanças sem código boilerplate em cada ação

**Solução**:
- Criada função `adicionarEventoHistorico()` centralizada
- Chamada automaticamente em `handleDragEnd`
- Tipo `EventoHistorico` com `detalhes` flexível

**Resultado**:
- Histórico completo e confiável
- Fácil adicionar novos tipos de eventos
- Código limpo e manutenível

**Status**: ✅ Implementado

---

## 📈 Evolução e Próximas Etapas

### Curto Prazo (1-2 semanas)

#### Backend e Persistência
- [ ] **Ativar Lovable Cloud / Supabase**
  - Criar projeto Supabase
  - Configurar variáveis de ambiente
  - Testar conexão

- [ ] **Migrar Mock Data para Database**
  - Criar tabelas principais (ex.: `clientes`, `historico`, `mensagens`)
  - Começar pelos módulos V2 mais críticos (Leads, Comercial, Financeiro)
  - Manter mocks apenas como fallback para desenvolvimento local

- [ ] **Implementar RLS (Row Level Security)**
  - Política: Cada workspace/clínica vê apenas seus dados
  - Política: Usuários veem apenas leads atribuídos a eles (ou todos se admin)
  - Testar isolamento de dados

- [ ] **CRUD de Leads com Persistência (V2)**
  - Criar lead (modal com formulário) no módulo `leads-v2`
  - Editar lead (aba Dados) no fluxo V2
  - Deletar lead (confirmação)
  - Atualizar status via drag & drop (já funciona em memória, só persistir)

- [ ] **Primeiros módulos totalmente conectados ao backend**
  - `leads-v2`, `comercial-v2`, `financeiro-v2` usando queries/mutações reais
  - Substituir gradualmente telas antigas de `src/pages` por módulos V2

#### Autenticação
- [ ] **Auth com Email/Password**
  - Página de login
  - Página de cadastro
  - Recuperação de senha
  - Logout funcional

- [ ] **Google OAuth**
  - Configurar Google Cloud Console
  - Implementar botão "Entrar com Google"

---

### Médio Prazo (3-5 semanas)

#### Comunicação em Tempo Real
- [ ] **Chat em Tempo Real**
  - Supabase Realtime subscriptions
  - Exibir "Digitando..." quando outro usuário escreve
  - Notificações de novas mensagens
  - Upload de arquivos (imagens, PDFs)

- [ ] **Integração WhatsApp Business API**
  - Configurar Meta Business
  - Receber mensagens automaticamente
  - Enviar mensagens do CRM
  - Sincronizar histórico

#### Notificações
- [ ] **Sistema de Notificações**
  - Notificações push (Firebase Cloud Messaging)
  - Email notifications (Resend ou SendGrid)
  - Preferências de notificação por usuário

#### Arquivos e Storage
- [ ] **Upload de Arquivos**
  - Supabase Storage buckets
  - Upload de imagens de procedimentos
  - Upload de contratos/propostas
  - Pré-visualização inline

#### Relatórios
- [ ] **Dashboard Analytics Avançado**
  - Taxa de conversão por origem
  - Tempo médio por status
  - Performance por responsável
  - Gráficos interativos (Recharts)

- [ ] **Exportação de Relatórios**
  - PDF (jspdf)
  - Excel (xlsx)
  - Filtros customizáveis

#### Automação
- [ ] **Automação de Follow-ups**
  - Lembretes automáticos após X dias sem interação
  - Templates de mensagens automáticas
  - Regras customizáveis (if lead em "proposta" por 3 dias, enviar lembrete)

---

### Longo Prazo (2-3 meses)

#### Performance
- [ ] **Lazy Loading de Componentes**
  ```typescript
  const Painel = lazy(() => import('./pages/crm/Painel'));
  ```

- [ ] **Virtualization para Listas Grandes**
  - @tanstack/react-virtual
  - Renderizar apenas cards visíveis no viewport

- [ ] **Service Worker para PWA**
  - Offline-first
  - Cache de assets estáticos
  - Background sync para mudanças offline

- [ ] **Otimização de Bundle Size**
  - Code splitting agressivo
  - Tree-shaking de libs grandes (Recharts, date-fns)
  - Compressão Brotli

#### Segurança
- [ ] **Rate Limiting**
  - Limitar requisições por IP
  - Proteção contra brute force

- [ ] **CSRF Protection**
  - Tokens CSRF em forms

- [ ] **Input Sanitization**
  - DOMPurify para conteúdo HTML
  - Validação rigorosa server-side

- [ ] **Audit Logs Completos**
  - Rastrear TODAS ações de usuários
  - Painel de auditoria no Super Admin
  - Compliance LGPD/GDPR

#### Expansão de Funcionalidades
- [ ] **IA para Sugestão de Respostas**
  - OpenAI API
  - Sugestões contextuais baseadas no histórico
  - Auto-complete de mensagens

- [ ] **App Mobile (React Native)**
  - Compartilhar código com web
  - Push notifications nativas
  - Câmera para scanner de documentos

- [ ] **Multi-idioma (i18n)**
  - react-i18next
  - Português, Inglês, Espanhol

- [ ] **Integrações Externas**
  - Google Calendar (agendamentos)
  - Stripe (pagamentos)
  - Zapier (automações)
  - Facebook Leads Ads (importação automática)

---

## 🧩 Guia para Continuidade

### Para Desenvolvedores Humanos

#### Entendendo o Fluxo de Dados

**Estado Atual**: 
```
Mock Data (memória) → Props → Componentes → UI
```

**Estado Futuro**:
```
Supabase → TanStack Query (cache) → Hooks → Componentes → UI
                ↓
          Mutations → Backend → Database
```

#### Padrões de Código

**✅ Boas Práticas**:

```typescript
// 1. Props tipadas e destructuring
interface Props { 
  cliente: ClientePotencial;
  onUpdate: (id: string) => void;
}

export const Component = ({ cliente, onUpdate }: Props) => {
  // ...
};

// 2. Hooks no topo do componente
const [state, setState] = useState<ClientePotencial | null>(null);
const { toast } = useToast();

// 3. Event handlers depois dos hooks
const handleUpdate = () => {
  setState(newState);
  onUpdate(cliente.id);
};

// 4. Early returns para loading/error
if (!cliente) return <Skeleton />;
if (error) return <Alert>Erro...</Alert>;

// 5. Return principal
return (
  <Card>
    {/* JSX */}
  </Card>
);
```

**❌ Evitar**:

```typescript
// ❌ useState sem tipo
const [data, setData] = useState<any>();

// ❌ Inline styles
<div style={{ color: 'red' }}>

// ❌ Funções anônimas inline (re-renders desnecessários)
<button onClick={() => handleClick(id)}>

// ❌ Classes CSS diretas
<div className="text-white bg-blue-500">

// ✅ Usar design system
<div className="text-foreground bg-primary">
```

#### Adicionando Novo Status ao Kanban

1. **Atualizar tipo** (`src/types/crm.ts`):
```typescript
export type StatusLead = 
  | 'novo'
  | 'qualificacao'
  | 'proposta'
  | 'negociacao'
  | 'ganho'
  | 'perdido'
  | 'followup'
  | 'novo_status';  // ← Adicionar aqui
```

2. **Adicionar coluna** (`src/pages/crm/Painel.tsx`):
```typescript
const colunas = [
  // ... colunas existentes
  { 
    id: 'novo_status' as StatusLead, 
    titulo: 'Novo Status', 
    cor: 'bg-purple-500' 
  },
];
```

3. **Atualizar helper** (`src/lib/mockDataCRM.ts`):
```typescript
export const obterTituloStatus = (status: StatusLead): string => {
  switch(status) {
    // ... cases existentes
    case 'novo_status': return 'Novo Status';
  }
};
```

4. **Adicionar mock data** (opcional):
```typescript
export const mockClientes: ClientePotencial[] = [
  // ...
  {
    id: 'cli-xxx',
    status: 'novo_status',
    // ... outros campos
  }
];
```

#### Criando Nova Página

1. **Criar arquivo** (`src/pages/NovoModulo.tsx`):
```typescript
import { Card } from "@/components/ui/card";

export default function NovoModulo() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Novo Módulo</h1>
      <Card>
        {/* Conteúdo */}
      </Card>
    </div>
  );
}
```

2. **Adicionar rota** (`src/App.tsx`):
```typescript
import NovoModulo from "./pages/NovoModulo";

// Dentro de <Routes>
<Route path="/novo-modulo" element={<NovoModulo />} />
```

3. **Adicionar item na sidebar** (`src/layouts/AppLayout.tsx`):
```typescript
import { IconeNovo } from "lucide-react";

// Dentro de sidebarItems
{
  title: "Novo Módulo",
  url: "/novo-modulo",
  icon: IconeNovo,
}
```

#### Conectando ao Supabase

**1. Criar Cliente Supabase** (`src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**2. Hook para Listar Clientes**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('dataCriacao', { ascending: false });
      
      if (error) throw error;
      return data as ClientePotencial[];
    }
  });
};
```

**3. Hook para Atualizar Status**:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useAtualizarStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusLead }) => {
      const { error } = await supabase
        .from('clientes')
        .update({ status, dataAtualizacao: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
  });
};
```

---

### Para IAs / LLMs

#### Contexto de Decisões

Este projeto foi construído com as seguintes premissas:

1. **Design System Baseado em HSL Tokens**
   - Cores em HSL (não RGB) para fácil manipulação de dark mode
   - Tokens semânticos (--primary, --foreground) em vez de cores diretas
   - Tailwind configurado para usar essas variáveis

2. **Componentes Shadcn/ui**
   - Composable: Pequenos componentes combinados
   - Acessível: ARIA compliant, keyboard navigation
   - Customizável: Código fonte no projeto (não npm package)

3. **TypeScript Strict Mode**
   - Previne bugs sutis em tempo de compilação
   - Autocomplete robusto
   - Refactoring seguro

4. **Naming em Português**
   - Cliente final é brasileiro
   - Termos de negócio em português (lead, proposta, follow-up)
   - Comentários e documentação em português

#### Padrões de Código

```typescript
// ✅ BOM: Componente funcional com props tipadas
interface CartaoProps {
  cliente: ClientePotencial;
  onClick: (id: string) => void;
}

export const CartaoCliente = ({ cliente, onClick }: CartaoProps) => {
  return (
    <Card onClick={() => onClick(cliente.id)}>
      <CardHeader>
        <CardTitle>{cliente.nome}</CardTitle>
      </CardHeader>
    </Card>
  );
};

// ✅ BOM: Hooks no topo, handlers depois
const [isOpen, setIsOpen] = useState(false);
const { toast } = useToast();

const handleOpen = () => setIsOpen(true);

// ✅ BOM: Early returns
if (loading) return <Skeleton />;
if (error) return <Alert variant="destructive">{error.message}</Alert>;

// ✅ BOM: Design tokens
<div className="bg-primary text-primary-foreground">

// ❌ EVITAR: any types
const [data, setData] = useState<any>();

// ❌ EVITAR: Inline styles
<div style={{ backgroundColor: '#000' }}>

// ❌ EVITAR: Cores diretas
<div className="bg-blue-500 text-white">

// ❌ EVITAR: Funções inline (causa re-renders)
<Button onClick={() => console.log('click')}>
```

#### Debugging

**Console warnings comuns**:

1. **"Function components cannot be given refs"**
   - Causa: Componente não usa `forwardRef`
   - Impacto: Baixo (warning apenas)
   - Fix: Wrap com `React.forwardRef`

2. **"Multiple renderers concurrently rendering the same context provider"**
   - Causa: Provider duplicado (ex: TooltipProvider em App.tsx e componente)
   - Impacto: Médio (pode causar bugs sutis)
   - Fix: Manter apenas um provider no nível mais alto

3. **"Cannot read properties of undefined"**
   - Causa: Dados mockados não carregaram ou prop undefined
   - Fix: Adicionar checks `if (!data) return null;`

#### Checklist de Pull Request

Antes de submeter código:

- [ ] **TypeScript sem erros**
  ```bash
  npm run build
  ```

- [ ] **Componentes testados manualmente**
  - Abrir em Chrome e Firefox
  - Testar mobile (DevTools responsive mode)

- [ ] **Dark mode funciona**
  - Toggle theme e verificar contraste

- [ ] **Responsivo**
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)

- [ ] **Sem console.logs desnecessários**
  - Remover `console.log()` de debug

- [ ] **Acessibilidade básica**
  - Navegação por teclado funciona (Tab, Enter, Esc)
  - Labels em inputs
  - Alt text em imagens

#### Versionamento

**Branches**:
- `main`: Produção (sempre estável)
- `develop`: Features em desenvolvimento
- `feature/nome-da-feature`: Nova funcionalidade
- `fix/descricao-do-bug`: Correção de bug

**Commits**:
```bash
# ✅ BOM: Mensagem descritiva
git commit -m "feat: adiciona filtro por valor estimado no Kanban"
git commit -m "fix: corrige warning de ref em ColunaKanban"
git commit -m "docs: atualiza README com instruções de deploy"

# ❌ EVITAR: Mensagem vaga
git commit -m "update"
git commit -m "fix bug"
```

**Prefixos convencionais**:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração (sem mudança de comportamento)
- `style:` Formatação, espaçamento
- `test:` Adicionar/atualizar testes
- `chore:` Manutenção (deps, config)

#### Documentação Contínua

**Quando atualizar o README**:
- Adicionar feature grande (novo módulo, integração)
- Mudar arquitetura (ex: adicionar Supabase)
- Adicionar dependência importante
- Resolver bug crítico

**Comentários no código**:
```typescript
// ✅ BOM: Explica "por quê", não "o quê"
// Usamos distance: 8 para evitar drag acidental em cliques rápidos
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  })
);

// ❌ EVITAR: Comentário óbvio
// Define o estado como false
const [isOpen, setIsOpen] = useState(false);
```

**Manter types atualizados** (`src/types/crm.ts`):
- Sempre que adicionar campo em ClientePotencial, atualizar interface
- Sempre que adicionar status, atualizar union type StatusLead
- Sempre que adicionar evento, atualizar TipoEvento

---

## 📝 Changelog

### 2025-12-21

- Atualizados os nomes dos módulos V2 para refletirem a nomenclatura usada na sidebar (Comercial, Agenda, Financeiro, Clientes, Jurídico, Marketing, WhatsApp, Estoque, Colaboradores, Relatórios e Playbook de Mensagens).
- Documentado o layout principal da aplicação (`AppLayout`) com as classes globais `.app-layout`, `.app-sidebar`, `.app-content` e `.content-scroll` em `src/index.css`.
- Sincronizado o README com as rotas V2 atuais descritas em `src/App.tsx`.

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [dnd-kit](https://docs.dndkit.com/)

### Supabase / Lovable Cloud

- [Supabase Docs](https://supabase.com/docs)
- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consultar este README
2. Verificar issues no GitHub
3. Consultar documentação oficial das libs
4. Contatar equipe de desenvolvimento

---

**Última atualização**: 2025-12-21  
**Versão do documento**: 1.1.0  
**Mantenedores**: Equipe Studio CRM