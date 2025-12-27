-- Adicionar novos campos na tabela leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS data_nascimento date,
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text;