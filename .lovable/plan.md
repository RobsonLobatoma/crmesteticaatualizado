

## Correcao: Gerar QR Code Real da Evolution API

### Problema Atual
O modal de QR Code mostra apenas um placeholder estatico "QR Code mock". Nao existe integracao real com a Evolution API para gerar e exibir o QR Code de conexao.

### Solucao Proposta
Criar uma Edge Function que chama o endpoint `/instance/connect/{instanceName}` da Evolution API e retorna o QR Code em base64 para exibicao no frontend.

### Arquitetura da Solucao

```text
[QRCodeModal]
    |
    v (useEffect ao abrir modal)
[fetchQrCode(instance)]
    |
    v (POST request)
[Edge Function: evolution-qrcode]
    |
    v (valida autenticacao)
    v (chama Evolution API: GET /instance/connect/{instanceName})
    v (retorna QR Code base64)
    |
    v
[Exibe imagem QR Code no modal]
```

### Alteracoes Necessarias

#### 1. Criar Edge Function: `supabase/functions/evolution-qrcode/index.ts`

Edge Function que recebe as credenciais da instancia e busca o QR Code na Evolution API:

| Parametro | Descricao |
|-----------|-----------|
| evolutionApiUrl | URL base da API Evolution |
| evolutionApiKey | Chave de API |
| instanceName | Nome da instancia configurada |

Endpoint Evolution API a ser chamado:
- `GET {evolutionApiUrl}/instance/connect/{instanceName}`
- Header: `apikey: {evolutionApiKey}`

Resposta esperada da Evolution API:
```json
{
  "base64": "data:image/png;base64,iVBORw0KGgo...",
  "code": "2@y8eK+bjtEjUWy9/FOM...",
  "count": 1
}
```

#### 2. Atualizar `QRCodeModal.tsx`

Modificacoes necessarias:

| Item | Antes | Depois |
|------|-------|--------|
| Estado | Nenhum | `qrCode`, `isLoading`, `error` |
| useEffect | Nao existe | Busca QR ao abrir modal |
| Exibicao | Texto "QR Code mock" | Imagem base64 real |
| Loading | Nao existe | Spinner durante busca |
| Erro | Nao existe | Mensagem de erro + retry |
| Polling | Nao existe | Atualiza QR a cada 30s (expira) |

Estados a adicionar:
```typescript
const [qrCode, setQrCode] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

#### 3. Adicionar Hook ou Funcao para Buscar QR Code

No hook `useEvolutionInstances.ts`, adicionar:

```typescript
const fetchQrCode = async (instance: EvolutionInstanceConfig): Promise<string | null> => {
  // Chama Edge Function evolution-qrcode
  // Retorna base64 do QR Code ou null em caso de erro
}
```

#### 4. Atualizar Interface do Modal

Novo layout do modal:

| Estado | Exibicao |
|--------|----------|
| Loading | Skeleton + "Gerando QR Code..." |
| Sucesso | Imagem QR Code + instrucoes |
| Erro | Mensagem erro + botao "Tentar novamente" |
| Conectado | Mensagem de sucesso + fechar modal |

### Resumo dos Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/evolution-qrcode/index.ts` | Criar - Edge Function para buscar QR |
| `src/modules/whatsapp-v2/QRCodeModal.tsx` | Atualizar - Integrar com Edge Function |
| `src/modules/whatsapp-v2/hooks/useEvolutionInstances.ts` | Atualizar - Adicionar `fetchQrCode` |

### Seguranca

| Verificacao | Implementacao |
|-------------|---------------|
| Autenticacao | Requer token JWT valido do usuario |
| Credenciais | API Key nunca exposta no frontend (via Edge Function) |
| Timeout | Limite de 30 segundos para resposta |

### Tratamento de Erros

| Cenario | Acao |
|---------|------|
| URL invalida | Exibir "URL da API invalida" |
| API Key incorreta | Exibir "Credenciais invalidas" |
| Instancia nao existe | Exibir "Instancia nao encontrada na Evolution API" |
| Timeout | Exibir "Tempo esgotado, tente novamente" |
| Ja conectado | Exibir "Instancia ja conectada" |

