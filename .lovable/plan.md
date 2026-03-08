
# Plano: Corrigir envio ao Kanban + Arrastar colunas no Gerenciar Status

## 1. Corrigir "Já no Kanban" — Envio para "Novo Lead"

**Problema identificado**: No banco, existem dois status com "novo" no nome:
- `slug: "novo_hoje"` (name: "Novo ( Hoje )") — display_order: 0
- `slug: "novo_lead"` (name: "Novo Lead") — display_order: 1

A lógica atual (`name.includes('novo')`) encontra "Novo ( Hoje )" primeiro, não "Novo Lead". O contato é inserido com `status: "novo_hoje"` em vez de `"novo_lead"`.

**Correção em 2 arquivos**:

### `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts`
Alterar a busca do status na função `syncNewContactsToKanban` para priorizar o slug `novo_lead`:
```typescript
const novoLeadStatus = statuses?.find(s => s.slug === 'novo_lead') 
  || statuses?.find(s => s.name?.toLowerCase().includes('novo lead'))
  || statuses?.find(s => s.slug === 'novo_hoje' || s.slug === 'novo')
  || statuses?.[0];
```

### `src/modules/whatsapp-v2/page.tsx`
Mesma correção na função `getNovoLeadSlug`:
```typescript
const novoStatus = activeStatuses.find(s => s.slug === 'novo_lead')
  || activeStatuses.find(s => s.name?.toLowerCase().includes('novo lead'))
  || activeStatuses.find(s => s.slug === 'novo_hoje' || s.slug === 'novo')
  || activeStatuses[0];
```

## 2. Arrastar colunas no "Gerenciar Status"

**Arquivo**: `src/modules/kanbam-v2/pages/ConfiguracoesCRM.tsx`

Adicionar drag-and-drop na lista de status usando `@dnd-kit/core` e `@dnd-kit/sortable` (já instalados). Ao soltar, atualizar o `display_order` de cada status reordenado via `updateStatus.mutate`.

**Implementação**:
- Envolver a lista de status com `DndContext` + `SortableContext` (vertical list strategy)
- Transformar cada item de status em componente sortable com `useSortable`
- O ícone `GripVertical` já existe no template — ativá-lo como handle de arraste
- No `onDragEnd`, reordenar com `arrayMove` e atualizar `display_order` de cada status via batch de mutations

**Arquivos a modificar**:

| Arquivo | Mudança |
|---------|---------|
| `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts` | Priorizar slug `novo_lead` |
| `src/modules/whatsapp-v2/page.tsx` | Priorizar slug `novo_lead` no `getNovoLeadSlug` |
| `src/modules/kanbam-v2/pages/ConfiguracoesCRM.tsx` | Adicionar drag-and-drop para reordenar status |
