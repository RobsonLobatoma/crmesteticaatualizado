/**
 * Utilitários para mascaramento e proteção de dados sensíveis
 * 
 * IMPORTANTE: Estes utilitários devem ser usados em todas as interfaces
 * que exibem CPF, telefone, endereço e outros dados pessoais.
 */

/**
 * Mascara CPF exibindo apenas os 3 primeiros e 2 últimos dígitos
 * Exemplo: 123.456.789-01 → 123.***.***-01
 */
export function maskCPF(cpf: string | null | undefined): string {
  if (!cpf) return "-";
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return "***.***.***-**";
  return `${clean.slice(0, 3)}.***.***-${clean.slice(-2)}`;
}

/**
 * Mascara telefone exibindo apenas DDD e últimos 4 dígitos
 * Exemplo: (11) 99999-1234 → (11) *****-1234
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 8) return "****-****";
  if (clean.length >= 10) {
    return `(${clean.slice(0, 2)}) *****-${clean.slice(-4)}`;
  }
  return `*****-${clean.slice(-4)}`;
}

/**
 * Mascara endereço exibindo apenas cidade/estado
 * Exemplo: Rua das Flores, 123 - Centro, São Paulo/SP → São Paulo/SP
 */
export function maskAddress(address: string | null | undefined): string {
  if (!address) return "-";
  const parts = address.split(',');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].trim();
    // Tenta extrair cidade/estado
    const cityState = lastPart.split('/');
    if (cityState.length === 2) {
      return lastPart;
    }
    // Se não tiver formato cidade/estado, mostra última parte
    return lastPart.length > 20 ? `${lastPart.slice(0, 20)}...` : lastPart;
  }
  return address.length > 15 ? `${address.slice(0, 15)}...` : address;
}

/**
 * Extrai apenas cidade do endereço completo (para uso em listagens)
 */
export function extractCity(address: string | null | undefined): string {
  if (!address) return "-";
  const parts = address.split(",");
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].trim();
    const cityState = lastPart.split("/");
    return cityState[0]?.trim() || "-";
  }
  return "-";
}

/**
 * Sanitiza texto para prevenir XSS
 * Remove tags HTML e caracteres perigosos
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, '') // Remove tags HTML
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .trim();
}

/**
 * Valida formato de CPF (apenas estrutura, não valida dígitos verificadores)
 */
export function isValidCPFFormat(cpf: string | null | undefined): boolean {
  if (!cpf) return false;
  const clean = cpf.replace(/\D/g, '');
  return clean.length === 11;
}

/**
 * Valida formato de telefone brasileiro
 */
export function isValidPhoneFormat(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, '');
  return clean.length >= 10 && clean.length <= 11;
}

/**
 * Valida formato de CEP
 */
export function isValidCEPFormat(cep: string | null | undefined): boolean {
  if (!cep) return false;
  const clean = cep.replace(/\D/g, '');
  return clean.length === 8;
}
