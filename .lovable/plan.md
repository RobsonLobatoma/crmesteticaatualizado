
## Correção do Layout da Lista de Conversas no WhatsApp

### Problema Identificado
A coluna de "Conversas" no Inbox do WhatsApp está se estendendo verticalmente sem limite porque:
1. O container pai (grid de 3 colunas) não tem altura fixa
2. A `ChatList` usa `h-full` que depende de uma altura definida no pai
3. O layout atual permite que o conteúdo cresça indefinidamente em vez de criar scroll interno

### Solução Proposta
Aplicar altura fixa/calculada ao grid do Inbox para que as colunas tenham scroll interno adequado, mantendo a visualização consistente.

---

### Alteracoes Tecnicas

#### 1. Atualizar page.tsx - Grid do Inbox
**Arquivo**: `src/modules/whatsapp-v2/page.tsx`

**Mudanca**: Adicionar altura fixa ao grid principal do Inbox

```tsx
// Antes (linha 221)
<div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1.4fr)_minmax(0,1fr)]">

// Depois
<div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1.4fr)_minmax(0,1fr)] h-[calc(100vh-220px)] min-h-[500px]">
```

**Mudanca**: Container da lista de chats com altura limitada

```tsx
// Antes (linha 222)
<div className="flex flex-col gap-2">

// Depois
<div className="flex flex-col gap-2 h-full min-h-0">
```

#### 2. Atualizar ChatList.tsx - Scroll Interno
**Arquivo**: `src/modules/whatsapp-v2/ChatList.tsx`

**Mudanca**: Garantir que o container principal use `flex-1` e `min-h-0` para permitir scroll interno adequado

```tsx
// Antes (linha 14)
<div className="flex h-full flex-col rounded-xl border border-border/70 bg-surface-elevated/80">

// Depois
<div className="flex flex-1 min-h-0 flex-col rounded-xl border border-border/70 bg-surface-elevated/80">
```

**Mudanca**: ScrollArea com altura flexivel

```tsx
// Antes (linha 19)
<ScrollArea className="h-full">

// Depois
<ScrollArea className="flex-1 min-h-0">
```

#### 3. Ajustar Coluna de Mensagens
**Arquivo**: `src/modules/whatsapp-v2/page.tsx`

**Mudanca**: Container de mensagens com altura flexivel

```tsx
// Antes (linha 263)
<div className="flex min-h-[360px] flex-col rounded-xl border border-border/70 bg-background/80">

// Depois
<div className="flex h-full min-h-[360px] flex-col rounded-xl border border-border/70 bg-background/80">
```

#### 4. Ajustar Coluna de Detalhes do Lead
**Arquivo**: `src/modules/whatsapp-v2/page.tsx`

**Mudanca**: Container de detalhes com scroll proprio

```tsx
// Antes (linha 315)
<div className="flex flex-col gap-3">

// Depois
<ScrollArea className="h-full">
  <div className="flex flex-col gap-3 pr-2">
```

---

### Resultado Esperado
- Lista de conversas com altura fixa e barra de scroll lateral visivel
- Area de mensagens com scroll interno
- Coluna de detalhes do lead com scroll se necessario
- Layout responsivo que nao ultrapassa a viewport
- Experiencia de usuario similar a apps de mensagens (WhatsApp Web, Telegram)

### Arquivos a Modificar
| Arquivo | Tipo de Mudanca |
|---------|-----------------|
| `src/modules/whatsapp-v2/page.tsx` | Adicionar altura fixa ao grid e ajustar containers |
| `src/modules/whatsapp-v2/ChatList.tsx` | Ajustar classes flex para scroll interno |
