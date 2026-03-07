

# Plano: Correções e Novas Funcionalidades no Inbox WhatsApp

## 1. Corrigir "Já no Kanban" — Envio real para status "Novo Lead"

**Problema**: O `syncNewContactsToKanban` busca o primeiro `crm_statuses` ativo ordenado por `display_order`, que pode não ser o status "Novo Lead". O mesmo ocorre no botão manual.

**Correção em `useWhatsappChats.ts`**:
- Alterar a query de `crm_statuses` para buscar especificamente o status cujo `name` contenha "Novo" (case-insensitive), ou cujo `slug` seja `novo_hoje` ou `novo`. Se não encontrar, usar fallback do primeiro ativo.

**Correção em `page.tsx`** (botão manual):
- Aplicar a mesma lógica: buscar o status "Novo Lead" / "Novo(hoje)" dos `crmStatuses` já carregados, em vez de pegar o primeiro por `display_order`.

## 2. Adicionar "Cadastro Rápido" nas Ações Rápidas

**Nova funcionalidade**: Um botão "Cadastro rápido" que abre um Dialog com o mesmo formulário do "Leads do dia (cadastro rápido)" da página de Leads.

**Implementação em `page.tsx`**:
- Adicionar estado `showQuickLeadForm` (boolean).
- Adicionar botão "Cadastro rápido" na seção "Ações rápidas".
- Criar um `Dialog` com o formulário completo (mesmos campos do Leads: Data Entrada, Responsável, Nome, Contato, Origem, Procedimento, Status, datas, CPF, CEP com auto-fill, Endereço, Tags, Observação).
- O nome e contato serão pré-preenchidos com dados do chat selecionado (`selectedChat.leadName` e `selectedChat.phoneNumber`).
- Ao salvar, usar o hook `useLeads` (importar `createLead`) para inserir na tabela `leads`.
- Importar utilitários existentes: `fetchAddressByCep`, `formatCep`, `formatCpf` de `@/modules/leads-v2/utils/cepUtils`.
- Importar `TagsSelector` e `useLeadTags` para gerenciamento de tags.
- Importar `useCRMStatuses` (já importado) para popular o dropdown de status.

## 3. Ativar "Agendar Avaliação" integrado com Agenda

**Nova funcionalidade**: O botão "Agendar avaliação" abre um Dialog com um formulário simplificado de agendamento.

**Implementação em `page.tsx`**:
- Adicionar estado `showScheduleModal` (boolean).
- Criar um `Dialog` com campos essenciais:
  - **Cliente**: Pré-preenchido (buscar ou criar via `useClients` do módulo agenda).
  - **Data**: Input date.
  - **Horário**: Input time.
  - **Profissional**: Select populado por `useProfessionals`.
  - **Serviço**: Select populado por `useServices` (para selecionar "Avaliação" ou similar).
  - **Duração**: Select com opções padrão (30min, 1h, etc.).
  - **Observações**: Textarea.
- Ao submeter, usar `useAppointments` para criar o agendamento na tabela `appointments`.
- Criar o cliente na tabela `clients` automaticamente se não existir (usando `useClients.createClient`).

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts` | Corrigir lógica de busca do status "Novo Lead" |
| `src/modules/whatsapp-v2/page.tsx` | Corrigir botão manual + adicionar Cadastro Rápido + Agendar Avaliação |

## Novos Imports Necessários no `page.tsx`

```tsx
import { useLeads } from "@/modules/leads-v2/hooks/useLeads";
import { useLeadTags } from "@/modules/leads-v2/hooks/useLeadTags";
import { fetchAddressByCep, formatCep, formatCpf } from "@/modules/leads-v2/utils/cepUtils";
import { TagsSelector } from "@/modules/leads-v2/components/TagsSelector";
import { useClients } from "@/modules/agenda-v2/hooks/useClients";
import { useProfessionals } from "@/modules/agenda-v2/hooks/useProfessionals";
import { useServices } from "@/modules/agenda-v2/hooks/useResources";
import { useAppointments } from "@/modules/agenda-v2/hooks/useAppointments";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Calendar, UserPlus } from "lucide-react";
```

## Lógica de Status "Novo Lead" (Correção)

```typescript
// Em vez de pegar o primeiro status ativo por display_order:
const defaultStatus = statuses?.[0]?.slug || "novo";

// Corrigir para:
const novoLeadStatus = statuses?.find(s => 
  s.name?.toLowerCase().includes('novo') || 
  s.slug === 'novo_hoje' || 
  s.slug === 'novo'
);
const defaultStatus = novoLeadStatus?.slug || statuses?.[0]?.slug || "novo";
```

A mesma lógica será aplicada no botão manual dentro de `page.tsx`.

