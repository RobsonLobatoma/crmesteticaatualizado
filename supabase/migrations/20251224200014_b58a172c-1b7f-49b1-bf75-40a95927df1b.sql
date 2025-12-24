-- Remove demonstration/seed clients inserted on 2025-12-24
DELETE FROM public.clients 
WHERE name IN (
  'Maria Oliveira Santos',
  'Fernanda Almeida Costa',
  'Beatriz Lima Pereira',
  'Camila Rodrigues Silva',
  'Patrícia Souza Martins',
  'Luciana Ferreira Gomes',
  'Amanda Nascimento',
  'Renata Barbosa Dias'
);