

# Plano: Corrigir carregamento de áudios e imagens no WhatsApp Inbox

## Problema raiz

As URLs de mídia retornadas pela Evolution API são URLs temporárias do CDN do WhatsApp (`mmg.whatsapp.net`). Essas URLs:
1. **Expiram rapidamente** (minutos/horas)
2. **Têm restrições de CORS** — o browser não consegue carregá-las diretamente em `<img>` ou `<audio>`

Resultado: imagens não abrem e áudios não tocam.

## Solução

Criar uma edge function **proxy** que usa o endpoint da Evolution API `/chat/getBase64FromMediaMessage/{instance}` para baixar a mídia como base64, e retornar ao frontend. No frontend, converter base64 para data URI e exibir.

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/evolution-fetch-media-base64/index.ts` | **Nova** edge function proxy de mídia |
| `src/modules/whatsapp-v2/hooks/useWhatsappMessages.ts` | Adicionar função para buscar base64 de mídia |
| `src/modules/whatsapp-v2/MessageBubble.tsx` | Carregar mídia via proxy ao invés de URL direta |

### 1. Nova Edge Function: `evolution-fetch-media-base64`

Recebe `{ evolutionApiUrl, evolutionApiKey, instanceName, messageId, remoteJid }` e faz POST para `/chat/getBase64FromMediaMessage/{instance}` da Evolution API com o `messageId`. Retorna `{ base64, mimeType }`.

Se o endpoint de base64 não funcionar (algumas versões da Evolution API), faz fallback fazendo fetch direto da `mediaUrl` no servidor (sem CORS) e converte para base64.

### 2. MessageBubble — Carregar mídia sob demanda

Para mensagens do tipo `image`, `audio`, `video`, `document` com `mediaUrl`:
- Mostrar placeholder/loading inicialmente
- Fazer chamada à edge function proxy para obter base64
- Renderizar com `data:mimeType;base64,...` URI
- Cache no state para não re-buscar

Usar um hook interno `useMediaLoader` que:
- Recebe `messageId`, `mediaUrl`, `type`
- Faz fetch uma vez via edge function
- Retorna `{ dataUri, isLoading, error }`

### 3. Envio de mídia

O envio já está implementado via `evolution-send-media` com base64. Verificar se o endpoint `sendMedia` está correto para a versão da Evolution API v2. O formato atual parece correto (`/message/sendMedia/{instance}` com `media: "data:mime;base64,..."`).

### Detalhes técnicos

A edge function proxy resolve ambos os problemas (CORS e expiração) pois o fetch é feito server-side. O base64 é então servido ao frontend como data URI, que funciona nativamente em `<img>`, `<audio>`, e `<video>`.

Para performance, limitar o carregamento automático a imagens/áudios visíveis e adicionar um botão "Carregar" para documentos/vídeos pesados.

