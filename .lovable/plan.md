
# Plano: Inbox Sempre Visível

## Objetivo
Modificar o comportamento da aba "Inbox" para que seja sempre exibida, independente de haver instâncias configuradas. Quando uma instância for configurada, os dados serão carregados automaticamente.

## Estado Atual

Atualmente, na linha 210-221 do arquivo `page.tsx`:

```tsx
{evolutionInstances.length === 0 ? (
  <Card className="border-dashed...">
    <CardContent>
      <h3>Configure uma instância primeiro</h3>
      <Button onClick={() => setActiveTab("instances")}>
        Ir para Instâncias
      </Button>
    </CardContent>
  </Card>
) : (
  // Layout do Inbox completo
)}
```

Isso oculta o layout do Inbox quando não há instâncias.

---

## Mudanças Propostas

### 1. Remover a condicional que oculta o Inbox

Em vez de mostrar um card de "configure primeiro", sempre mostrar o layout completo do Inbox com 3 colunas.

### 2. Adaptar cada coluna para estado vazio

| Coluna | Com instância | Sem instância |
|--------|---------------|---------------|
| **Lista de chats** | Mostra dropdown + lista de chats | Mostra mensagem "Nenhuma instância configurada" + botão para ir para aba Instâncias |
| **Área de mensagens** | Mostra mensagens do chat selecionado | Mostra placeholder "Configure uma instância para começar" |
| **Resumo do lead** | Mostra dados do lead selecionado | Mostra placeholder padrão |

### 3. Layout visual mantido

O layout de 3 colunas permanece fixo:
```
[Chats] [Mensagens] [Resumo]
```

Apenas o conteúdo interno de cada coluna muda baseado no estado.

---

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/modules/whatsapp-v2/page.tsx` | Remover condicional e adaptar estados vazios dentro do layout |

---

## Detalhes Técnicos

### Estrutura do JSX Modificado

```tsx
<TabsContent value="inbox" className="flex flex-1 flex-col gap-4">
  <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1.4fr)_minmax(0,1fr)] h-[calc(100vh-220px)] min-h-[500px]">
    
    {/* Coluna 1: Lista de Chats */}
    <div className="flex flex-col gap-2 h-full min-h-0">
      {evolutionInstances.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="text-sm font-medium mb-1">Nenhuma instância</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Configure uma instância da Evolution API para ver os chats.
          </p>
          <Button size="sm" variant="outline" onClick={() => setActiveTab("instances")}>
            Configurar instância
          </Button>
        </div>
      ) : (
        <>
          {/* Dropdown de seleção + lista de chats existente */}
        </>
      )}
    </div>

    {/* Coluna 2: Área de Mensagens - sempre visível */}
    <div className="flex h-full min-h-[360px] flex-col rounded-xl border border-border/70 bg-background/80">
      {/* Mesmo conteúdo atual, com estado vazio quando não há instância */}
    </div>

    {/* Coluna 3: Resumo do Lead - sempre visível */}
    <ScrollArea className="h-full">
      {/* Mesmo conteúdo atual */}
    </ScrollArea>
  </div>
</TabsContent>
```

### Estados da Coluna de Mensagens

1. **Sem instância**: "Configure uma instância para começar"
2. **Com instância, sem chat selecionado**: "Selecione uma conversa à esquerda"
3. **Com chat, carregando**: Spinner de loading
4. **Com chat, sem mensagens**: "Nenhuma mensagem encontrada"
5. **Com chat e mensagens**: Lista de MessageBubble

---

## Resultado Esperado

- O Inbox sempre aparece com seu layout de 3 colunas
- Quando não há instância, a coluna da esquerda mostra um estado vazio amigável
- Quando uma instância é adicionada, os chats são carregados automaticamente
- Não há mais mudança brusca de layout ao configurar a primeira instância
