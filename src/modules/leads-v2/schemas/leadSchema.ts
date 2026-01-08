import { z } from 'zod';

/**
 * Schema de validação para criação/edição de leads
 * Implementa validação de entrada para prevenir dados malformados
 */
export const leadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos"),
  
  contato: z
    .string()
    .trim()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(20, "Telefone muito longo")
    .regex(/^[\d\s\-\(\)\+]+$/, "Telefone contém caracteres inválidos"),
  
  responsavel: z
    .string()
    .trim()
    .max(100, "Responsável deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  origem: z
    .string()
    .trim()
    .max(50, "Origem deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  
  procedimento: z
    .string()
    .trim()
    .max(100, "Procedimento deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  status: z
    .string()
    .trim()
    .max(50, "Status deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  
  cpf: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, '').length === 11,
      "CPF deve ter 11 dígitos"
    )
    .or(z.literal("")),
  
  cep: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, '').length === 8,
      "CEP deve ter 8 dígitos"
    )
    .or(z.literal("")),
  
  endereco: z
    .string()
    .trim()
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  
  bairro: z
    .string()
    .trim()
    .max(100, "Bairro deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  cidade: z
    .string()
    .trim()
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  estado: z
    .string()
    .trim()
    .max(2, "Estado deve ter 2 caracteres (sigla)")
    .optional()
    .or(z.literal("")),
  
  numero: z
    .string()
    .trim()
    .max(20, "Número deve ter no máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  
  complemento: z
    .string()
    .trim()
    .max(100, "Complemento deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  observacao: z
    .string()
    .trim()
    .max(1000, "Observação deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  
  valorFechado: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[\d.,\sR$]+$/.test(val),
      "Valor contém caracteres inválidos"
    )
    .or(z.literal("")),
  
  dataNascimento: z.string().optional().or(z.literal("")),
  dataEntrada: z.string().optional().or(z.literal("")),
  dataUltimoContato: z.string().optional().or(z.literal("")),
  dataAgendamento: z.string().optional().or(z.literal("")),
  dataAvaliacao: z.string().optional().or(z.literal("")),
  dataProcedimento: z.string().optional().or(z.literal("")),
  dataFechamento: z.string().optional().or(z.literal("")),
  compareceu: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

/**
 * Valida dados do lead e retorna erros formatados
 */
export function validateLead(data: unknown): { 
  success: boolean; 
  data?: LeadFormData; 
  errors?: Record<string, string>;
} {
  const result = leadSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path.join('.');
    errors[field] = err.message;
  });
  
  return { success: false, errors };
}

/**
 * Sanitiza dados do lead removendo caracteres perigosos
 */
export function sanitizeLeadData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove tags HTML e scripts
      sanitized[key] = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? item.replace(/<[^>]*>/g, '').trim() : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
