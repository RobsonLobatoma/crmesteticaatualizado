

# Plano: Auto-envio de novos contatos ao Kanban + Botão manual

## Objetivo
1. Quando novos contatos (telefones inéditos) aparecerem na lista de chats do WhatsApp, criar automaticamente um card no Kanban com status "novo" (slug do primeiro status ativo ou fallback para "novo").
2. Adicionar botão "Enviar ao Kanban" no card "Resumo do lead" para envio manual.

## Lógica de "novo contato" vs "conversa nova"
- A cada fetch de chats, comparar os telefones retornados com os telefones já existentes na tabela `crm_clients`.
- Apenas telefones que **não existem** em `crm_clients` são considerados "novos contatos" e serão inseridos automaticamente.
- Conversas de contatos já cadastrados no Kanban são ignoradas.

## Mudanças

### 1. `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts`
- Após o fetch de chats, consultar `crm_clients` filtrando pelos telefones retornados.
- Para cada telefone que **não** existe em `crm_clients`, inserir automaticamente um novo registro com:
  - `nome`: leadName ou phoneNumber
  - `telefone`: phoneNumber
  - `status`: slug do primeiro `crm_statuses` ativo (ou "novo")
  - `origem`: "WhatsApp"
  - `user_id`: auth.uid()
- Invalidar queryKey `['crm-clients']` após inserções.
- Retornar flag ou callback para saber quais contatos já estão no Kanban.

### 2. `src/modules/whatsapp-v2/page.tsx`
- Importar `useCRMClients` e `useCRMStatuses`.
- No card "Resumo do lead" (coluna 3), adicionar botão **"Enviar ao Kanban"**:
  - Verifica se o telefone do chat selecionado já existe em `crm_clients`.
  - Se já existe, mostra badge "Já no Kanban" (botão desabilitado).
  - Se não existe, ao clicar insere o contato no Kanban com status "novo".
- Toast de confirmação após envio.

### 3. Nenhuma migração necessária
- A tabela `crm_clients` já possui todos os campos necessários (nome, telefone, status, origem, user_id).
- A tabela `crm_statuses` já existe para buscar o slug do primeiro status.

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts` | Adicionar auto-sync de novos contatos para `crm_clients` |
| `src/modules/whatsapp-v2/page.tsx` | Adicionar botão "Enviar ao Kanban" no resumo do lead |

## Fluxo

```text
Fetch chats (Evolution API)
       ↓
Extrair telefones únicos
       ↓
Consultar crm_clients por esses telefones
       ↓
Telefones ausentes = novos contatos
       ↓
INSERT automático no crm_clients (status: "novo", origem: "WhatsApp")
       ↓
Invalidar cache ['crm-clients']
```

Para o botão manual:
```text
Usuário seleciona chat → Clica "Enviar ao Kanban"
       ↓
Verifica se telefone já existe em crm_clients
       ↓
Se não existe → INSERT → Toast sucesso
Se já existe → Toast "Já está no Kanban"
```

