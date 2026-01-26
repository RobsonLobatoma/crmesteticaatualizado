
## Ativacao Completa do Modulo WhatsApp e Comunicacao

### Visao Geral
O modulo atual possui apenas integracao parcial (QR Code funciona). Vamos ativar TODAS as funcionalidades de forma real usando a Evolution API v2.

### Estado Atual vs. Estado Desejado

| Funcionalidade | Estado Atual | Estado Desejado |
|----------------|--------------|-----------------|
| Gerenciamento de Instancias | Funcional | Manter |
| QR Code / Conexao | Funcional | Manter + melhorar status |
| Inbox (Lista de Chats) | Vazia (mock) | Buscar chats reais |
| Mensagens | Vazia (mock) | Buscar historico real |
| Envio de Mensagens | Mock local | Enviar via Evolution API |
| Templates | Mock vazio | Persistir no Supabase |
| Status de Conexao | Estatico | Polling em tempo real |
| Webhook de Mensagens | Nao existe | Receber mensagens em tempo real |

### Arquitetura da Solucao

```text
[Frontend WhatsApp V2]
        |
        v
[Edge Functions (Supabase)]
   |-- evolution-qrcode (existente)
   |-- evolution-fetch-chats (novo)
   |-- evolution-fetch-messages (novo)
   |-- evolution-send-message (novo)
   |-- evolution-check-status (novo)
   |-- evolution-webhook (novo - recebe msgs)
        |
        v
[Evolution API Externa]
        |
        v
[WhatsApp via Baileys]
```

---

### Fase 1: Edge Functions para Comunicacao Real

#### 1.1 - evolution-fetch-chats
Busca todos os chats/conversas da instancia.

Endpoint Evolution API:
```text
POST /chat/findChats/{instance}
Header: apikey: {evolutionApiKey}
```

Funcionalidade:
- Retorna lista de chats ativos
- Inclui ultimo preview de mensagem
- Inclui contador de nao lidos

#### 1.2 - evolution-fetch-messages
Busca historico de mensagens de um chat especifico.

Endpoint Evolution API:
```text
POST /chat/findMessages/{instance}
Header: apikey: {evolutionApiKey}
Body: { "where": { "key": { "remoteJid": "{phoneNumber}@s.whatsapp.net" } } }
```

Funcionalidade:
- Retorna ultimas N mensagens do chat
- Inclui direcao (inbound/outbound)
- Inclui tipo (text, image, audio, document)

#### 1.3 - evolution-send-message
Envia mensagem de texto para um numero.

Endpoint Evolution API:
```text
POST /message/sendText/{instance}
Header: apikey: {evolutionApiKey}
Body: {
  "number": "5511999999999",
  "text": "Mensagem a enviar",
  "delay": 1000
}
```

#### 1.4 - evolution-check-status
Verifica status de conexao da instancia.

Endpoint Evolution API:
```text
GET /instance/fetchInstances
Header: apikey: {evolutionApiKey}
```

Retorna:
- Status: "open" (conectado), "close" (desconectado)
- Numero do telefone conectado
- Nome do perfil

---

### Fase 2: Atualizacoes no Frontend

#### 2.1 - Novo Hook: useWhatsappChats
Arquivo: `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts`

Funcionalidades:
- Buscar chats da instancia selecionada
- Atualizar automaticamente a cada 30 segundos
- Mapear dados da Evolution API para tipo `WhatsappChat`

#### 2.2 - Novo Hook: useWhatsappMessages
Arquivo: `src/modules/whatsapp-v2/hooks/useWhatsappMessages.ts`

Funcionalidades:
- Buscar mensagens do chat selecionado
- Mapear dados da Evolution API para tipo `WhatsappMessage`
- Refetch ao selecionar chat diferente

#### 2.3 - Atualizar SendMessageBox
Arquivo: `src/modules/whatsapp-v2/SendMessageBox.tsx`

Modificacoes:
- Substituir envio local por chamada a Edge Function
- Adicionar estado de loading durante envio
- Exibir toast de sucesso/erro
- Atualizar lista de mensagens apos envio

#### 2.4 - Atualizar page.tsx
Arquivo: `src/modules/whatsapp-v2/page.tsx`

Modificacoes:
- Substituir `chats` e `messages` de useState por hooks reais
- Integrar com instancia selecionada
- Adicionar polling de status de conexao
- Remover badge "Simulacao front-end"

---

### Fase 3: Templates de Mensagens (Persistencia)

#### 3.1 - Tabela no Supabase
Criar tabela `whatsapp_templates`:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK para profiles |
| name | TEXT | Nome do template |
| content | TEXT | Conteudo da mensagem |
| type | TEXT | 'manual' ou 'automatic' |
| trigger_type | TEXT | 'keyword' ou 'event' |
| trigger_value | TEXT | Valor do gatilho |
| is_active | BOOLEAN | Ativo/Inativo |
| created_at | TIMESTAMP | Data criacao |
| updated_at | TIMESTAMP | Data atualizacao |

#### 3.2 - Hook useWhatsappTemplates
CRUD completo para templates usando Supabase.

#### 3.3 - Atualizar aba Templates
Modificar a aba para:
- Listar templates do banco
- Modal de criacao/edicao
- Ativar/desativar templates
- Deletar templates

---

### Fase 4: Status em Tempo Real

#### 4.1 - Polling de Status
Hook `useInstanceStatus`:
- Verificar conexao a cada 15 segundos
- Atualizar badge no InstanceCard
- Detectar desconexao automaticamente

#### 4.2 - Atualizar InstanceCard
- Badge com status em tempo real
- Exibir numero conectado quando disponivel
- Botao "Reconectar" se desconectado

---

### Fase 5: Webhook para Mensagens em Tempo Real (Opcional Avanado)

#### 5.1 - Edge Function evolution-webhook
Endpoint que recebe eventos da Evolution API:
- MESSAGE_RECEIVED
- MESSAGE_UPDATE
- CONNECTION_UPDATE

#### 5.2 - Configurar Webhook na Evolution API
Endpoint Evolution API:
```text
POST /webhook/set/{instance}
Body: {
  "enabled": true,
  "url": "https://{project}.supabase.co/functions/v1/evolution-webhook",
  "webhookByEvents": true,
  "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
}
```

#### 5.3 - Armazenar Mensagens no Supabase
Tabela `whatsapp_messages` para persistir historico localmente.

---

### Resumo dos Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/evolution-fetch-chats/index.ts` | Criar |
| `supabase/functions/evolution-fetch-messages/index.ts` | Criar |
| `supabase/functions/evolution-send-message/index.ts` | Criar |
| `supabase/functions/evolution-check-status/index.ts` | Criar |
| `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts` | Criar |
| `src/modules/whatsapp-v2/hooks/useWhatsappMessages.ts` | Criar |
| `src/modules/whatsapp-v2/hooks/useWhatsappTemplates.ts` | Criar |
| `src/modules/whatsapp-v2/hooks/useInstanceStatus.ts` | Criar |
| `src/modules/whatsapp-v2/SendMessageBox.tsx` | Modificar |
| `src/modules/whatsapp-v2/page.tsx` | Modificar |
| `src/modules/whatsapp-v2/components/InstanceCard.tsx` | Modificar |
| `supabase/config.toml` | Modificar (add functions) |
| `supabase/migrations/xxx_whatsapp_templates.sql` | Criar |

---

### Ordem de Implementacao

1. **Edge Functions** (backend primeiro)
   - evolution-fetch-chats
   - evolution-fetch-messages
   - evolution-send-message
   - evolution-check-status

2. **Hooks do Frontend**
   - useWhatsappChats
   - useWhatsappMessages
   - useInstanceStatus

3. **Integracao na Pagina**
   - Atualizar page.tsx para usar hooks reais
   - Atualizar SendMessageBox para envio real

4. **Templates**
   - Criar tabela whatsapp_templates
   - Hook useWhatsappTemplates
   - Atualizar aba Templates

5. **Status em Tempo Real**
   - Polling de status
   - Atualizar InstanceCard

---

### Tratamento de Erros

| Cenario | Acao |
|---------|------|
| Instancia desconectada | Exibir alerta + botao reconectar |
| Falha ao buscar chats | Toast erro + retry |
| Falha ao enviar mensagem | Toast erro + manter texto |
| API Key invalida | Mensagem clara no card |
| Timeout | Retry automatico |

### Seguranca

Todas as Edge Functions incluem:
- Validacao JWT do usuario
- API Keys nunca expostas no frontend
- Timeout de 30 segundos
- Logs de operacoes
