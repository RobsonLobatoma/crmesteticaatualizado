
# Plano de Correção da Integração WhatsApp com Evolution API v2

## Resumo do Problema

A integração atual está apresentando erros 502 (DNS) e 401 (credenciais inválidas) ao tentar conectar com a Evolution API. Após análise da documentação oficial e do código atual, identifiquei os problemas e as correções necessárias.

---

## Problemas Identificados

### 1. Erro 502 - DNS não resolvido
O domínio `api.automacoesrowaize.com.br` configurado não existe no DNS público.

### 2. Erro 401 - Credenciais inválidas
Pode ser causado por:
- API Key incorreta ou com espaços
- Instância não existe no servidor Evolution
- URL com formato incorreto (ex: `https:https://`)

### 3. Formato de requisição inconsistente
A Evolution API v2 tem endpoints específicos que precisam ser chamados com o formato correto:

| Endpoint | Método | Formato v2 |
|----------|--------|------------|
| `/chat/findChats/{instance}` | POST | `{}` ou filtros |
| `/chat/findMessages/{instance}` | POST | `{ "where": { "key": { "remoteJid": "..." } } }` |
| `/message/sendText/{instance}` | POST | `{ "number": "...", "text": "...", "delay": 123 }` |
| `/instance/connectionState/{instance}` | GET | - |
| `/instance/connect/{instance}` | GET | - |

---

## Correções a Implementar

### 1. Normalização de URL (já implementado parcialmente)
- Corrigir `https:https://` para `https://`
- Remover barras finais
- Adicionar protocolo se não existir

### 2. Melhorar Edge Functions

#### `evolution-fetch-chats/index.ts`
- Adicionar normalização de URL completa
- Melhorar tratamento de erros com detalhes
- Log detalhado para debug

#### `evolution-fetch-messages/index.ts`
- Corrigir formato do body conforme documentação v2:
```javascript
{
  "where": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    }
  },
  "limit": 100
}
```

#### `evolution-send-message/index.ts`
- Adicionar normalização de URL
- Formato correto para v2:
```javascript
{
  "number": "5511999999999",
  "text": "Sua mensagem aqui",
  "delay": 1000,
  "linkPreview": false
}
```

#### `evolution-check-status/index.ts`
- Adicionar normalização de URL
- Melhorar detecção de erros de DNS

#### `evolution-qrcode/index.ts`
- Adicionar normalização de URL

### 3. Adicionar Botão "Testar Conexão"
Antes de salvar uma instância, validar se a URL e API Key estão funcionando.

### 4. Melhorar Feedback de Erros
Exibir mensagens de erro inline no Inbox ao invés de tela em branco.

---

## Detalhes Técnicos

### Estrutura das Edge Functions Corrigidas

#### Normalização de URL (função compartilhada)
```typescript
function normalizeEvolutionApiUrl(input: string) {
  const trimmed = input.trim();
  // Fix double scheme: https:https://domain → https://domain
  const fixed = trimmed.replace(/^(https?:)(https?:\/\/)/i, "$2");
  // Add protocol if missing
  const withProtocol = !/^https?:\/\//i.test(fixed) ? `https://${fixed}` : fixed;
  // Remove trailing slashes
  return withProtocol.replace(/\/+$/, "");
}
```

#### Endpoint `/chat/findMessages` - Body correto
```typescript
body: JSON.stringify({
  where: {
    key: { remoteJid: `${cleanPhone}@s.whatsapp.net` }
  },
  limit: 100
})
```

#### Endpoint `/message/sendText` - Body correto
```typescript
body: JSON.stringify({
  number: cleanPhone,  // Sem @s.whatsapp.net
  text: message,
  delay: 1000,
  linkPreview: false
})
```

### Componente de Teste de Conexão

Novo componente no modal de instância que:
1. Chama `/instance/connectionState/{instance}` para verificar conectividade
2. Retorna status: OK, erro de credenciais, erro de DNS, timeout
3. Só permite salvar se teste passar (opcional)

### Tratamento de Erros no Inbox

```typescript
// Em vez de tela em branco, mostrar Alert
{error && (
  <Alert variant="destructive">
    <AlertTitle>Erro de conexão</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/evolution-fetch-chats/index.ts` | Atualizar normalização e erros |
| `supabase/functions/evolution-fetch-messages/index.ts` | Atualizar normalização e erros |
| `supabase/functions/evolution-send-message/index.ts` | Adicionar normalização |
| `supabase/functions/evolution-check-status/index.ts` | Adicionar normalização e erros DNS |
| `supabase/functions/evolution-qrcode/index.ts` | Adicionar normalização |
| `src/modules/whatsapp-v2/components/InstanceFormModal.tsx` | Adicionar botão testar conexão |
| `src/modules/whatsapp-v2/page.tsx` | Adicionar feedback de erros inline |
| `src/modules/whatsapp-v2/hooks/useWhatsappChats.ts` | Expor erro para UI |

---

## Próximos Passos para o Usuário

Após implementar as correções:

1. **Editar a instância "advogado"**:
   - Substituir `https:https://api.automacoesrowaize.com.br` por uma URL válida:
     - Se tiver DNS: `https://api.automacoesrowaize.com.br` (precisa criar registro A/CNAME)
     - Se usar IP: `http://123.45.67.89:8080` (IP do servidor Evolution)

2. **Verificar a API Key**: Copiar novamente do painel da Evolution API sem espaços

3. **Verificar o nome da instância**: Deve ser exatamente igual ao cadastrado na Evolution

---

## Resultado Esperado

Após as correções:
- URLs malformadas serão corrigidas automaticamente
- Erros de DNS mostrarão mensagem clara pedindo para verificar configuração
- Erros 401 mostrarão detalhes do que está errado
- Inbox mostrará mensagens de erro inline ao invés de tela em branco
- Botão de teste permitirá validar antes de salvar
