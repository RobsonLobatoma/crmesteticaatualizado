

# Plano: Corrigir layout das conversas e funcionalidade de mídia

## Problemas Identificados

### 1. Informações cortadas na lista de conversas
O `StatusBadge` ("Novo", "N...") está sendo cortado na lateral direita. A coluna tem apenas 260px e o badge compete com o nome/número. Solução: reduzir o badge para um pequeno ícone colorido em vez do texto completo.

### 2. Envio de mídia não funciona
O `SendMessageBox` tem prop `onSendMedia` mas `page.tsx` **nunca passa essa prop**. Além disso, não existe edge function para enviar mídia (`evolution-send-media`). O hook `useSendMessage` só suporta texto.

### 3. Exibição de mídia recebida não funciona
O `MessageBubble` trata imagem/áudio/documento mas:
- **Imagens**: Só renderiza `<img>` se content começa com "http", mas o edge function coloca apenas `caption` ou `[Imagem]` no content — nunca a URL real.
- **Áudio**: Mostra apenas ícone + texto "[Áudio]", sem player.
- **Documentos**: Mostra apenas ícone + nome, sem link para download.

A raiz é que o edge function `evolution-fetch-messages` não extrai as URLs de mídia da Evolution API.

---

## Alterações

### 1. ChatList — Substituir StatusBadge por ícone compacto

**Arquivo**: `src/modules/whatsapp-v2/ChatList.tsx`

Substituir o `<StatusBadge>` por um pequeno dot/ícone colorido com tooltip, para não consumir espaço horizontal. Um círculo de 8px com a cor do status e um ícone de "Novo Lead" (estrela ou ponto) quando aplicável.

### 2. Edge Function — Extrair URLs de mídia

**Arquivo**: `supabase/functions/evolution-fetch-messages/index.ts`

Na transformação de mensagens, extrair a URL real de mídia da Evolution API:
- `imageMessage.url` → colocar no campo `mediaUrl`
- `audioMessage.url` → colocar no campo `mediaUrl`  
- `documentMessage.url` → colocar no campo `mediaUrl`

Adicionar campo `mediaUrl` ao retorno de cada mensagem.

### 3. Tipo WhatsappMessage — Adicionar campo mediaUrl

**Arquivo**: `src/modules/whatsapp-v2/types.ts`

Adicionar `mediaUrl?: string` e expandir type para incluir `"video"`.

### 4. Hook useWhatsappMessages — Mapear mediaUrl

**Arquivo**: `src/modules/whatsapp-v2/hooks/useWhatsappMessages.ts`

Incluir `mediaUrl` no mapeamento de mensagens recebidas.

### 5. MessageBubble — Renderizar mídia real

**Arquivo**: `src/modules/whatsapp-v2/MessageBubble.tsx`

- **Imagem**: Usar `message.mediaUrl` para `<img>`, fallback para content se for URL.
- **Áudio**: Se `message.mediaUrl` existe, renderizar `<audio controls>`. Senão, texto "[Áudio]".
- **Documento**: Se `message.mediaUrl`, renderizar link clicável para download.
- **Vídeo**: Se `message.mediaUrl`, renderizar `<video controls>`.

### 6. Edge Function — Envio de mídia

**Novo arquivo**: `supabase/functions/evolution-send-media/index.ts`

Criar edge function que recebe `{ file (base64), mediaType, caption, phoneNumber, instance... }` e faz POST para:
- `/message/sendMedia/{instance}` da Evolution API v2

### 7. Hook useSendMessage — Adicionar sendMedia

**Arquivo**: `src/modules/whatsapp-v2/hooks/useSendMessage.ts`

Adicionar método `sendMedia(phoneNumber, file, mediaType, caption?)` que converte File para base64 e invoca a nova edge function.

### 8. page.tsx — Passar onSendMedia ao SendMessageBox

**Arquivo**: `src/modules/whatsapp-v2/page.tsx`

Criar handler `handleSendMedia` que usa `sendMedia` do hook e passar como prop `onSendMedia` ao `<SendMessageBox>`.

---

## Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `src/modules/whatsapp-v2/ChatList.tsx` | Substituir StatusBadge por dot compacto |
| `src/modules/whatsapp-v2/types.ts` | Adicionar `mediaUrl?` e tipo `"video"` |
| `src/modules/whatsapp-v2/hooks/useWhatsappMessages.ts` | Mapear `mediaUrl` |
| `src/modules/whatsapp-v2/MessageBubble.tsx` | Renderizar img/audio/video/doc com URLs reais |
| `src/modules/whatsapp-v2/hooks/useSendMessage.ts` | Adicionar `sendMedia` |
| `src/modules/whatsapp-v2/page.tsx` | Conectar `onSendMedia` |
| `supabase/functions/evolution-fetch-messages/index.ts` | Extrair `mediaUrl` |
| `supabase/functions/evolution-send-media/index.ts` | **Nova** edge function para envio de mídia |

