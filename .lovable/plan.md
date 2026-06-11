# Banco de Materiais — Plano de Implementação

Módulo completo de acervo de marketing da Clínica ACAS, com pastas, materiais, controle de postagens e criativos de tráfego — sem planilhas externas.

## 1. Localização no app

- Novo item no menu lateral: **Banco de Materiais**, posicionado logo abaixo de "Playbook de Mensagens".
- Justificativa: o volume de telas (dashboard, pastas, tabela, kanban, controle geral com 3 abas, detalhe de material) não cabe como sub-aba dentro de Marketing & Relacionamento sem prejudicar a UX. Manter Marketing & Relacionamento como está.
- Rota: `/banco-materiais`.

## 2. Backend (Supabase)

Migração criando as tabelas abaixo, todas com RLS por usuário autenticado (qualquer usuário logado da clínica pode ler/escrever; super_admin tudo). Bucket de Storage `materiais` (privado) para uploads.

Tabelas:

- `material_folders` — árvore de pastas: `id, parent_id, name, slug, order_index, procedure_slug, created_by`.
- `material_procedures` — procedimentos editáveis (ThermoFit, Tanajura, etc.).
- `material_areas` — áreas tratadas editáveis (Abdômen, Glúteo, etc.).
- `material_tags` — tags livres.
- `materials` — registro central com todos os campos do briefing:
  - identificação: `id`, `internal_code` (IMG001/VID001/CRI001), `patient_code` (PAC001), `name`, `folder_id`
  - classificação: `material_type` (foto, video_bruto, video_editado, print, depoimento, documento, template, logo, criativo_trafego, conteudo_publicado), `procedure_id`, `area_id`
  - datas: `captured_at, edited_at, approved_at, published_at`
  - status: `status` (enum com os 13 status do briefing)
  - arquivos: `raw_file_url, edited_file_url, thumbnail_url, raw_storage_path, edited_storage_path`
  - publicação: `posted` (bool), `posted_platforms` (text[]), `can_use_in_ads` (sim/nao/confirmar), `image_authorization` (sim/nao/pendente/na), `authorization_type`, `privacy_notes`
  - responsáveis: `uploaded_by, edited_by, approved_by` (uuid → profiles)
  - performance: `views, clicks, leads_generated, sales_generated, cpl, performance_notes`
  - extras: `tags` (text[]), `notes`
- `material_postings` — controle de postagens (id, material_id, procedure_id, theme, platform, format, posted_at, posted_by, post_url, result, notes).
- `material_ad_creatives` — criativos de tráfego (id, material_id, creative_name, procedure_id, angle, creative_type, status, started_at, paused_at, campaign, audience, cpl, leads, sales, revenue, performance_status, notes).
- `material_history` — auditoria (id, material_id, user_id, action, from_status, to_status, payload jsonb, created_at).
- Trigger em `materials` que insere em `material_history` em insert/update de status.

Seed: pastas e subpastas exatas do briefing (01_RESULTADOS… até 00_CONTROLE GERAL), procedimentos e áreas iniciais.

Storage: bucket privado `materiais` + policies (authenticated lê/escreve, super_admin tudo).

## 3. Frontend

Estrutura `src/modules/banco-materiais-v2/`:

- `page.tsx` — shell com header, botões principais (Novo material, Nova pasta, Importar, Controle geral, Filtros, Exportar) e tabs internas: **Dashboard**, **Pastas**, **Tabela**, **Kanban**, **Controle Geral**.
- `components/`
  - `MaterialDashboard.tsx` — cards de KPI + gráficos (recharts) por procedimento, status, mês, performance.
  - `FolderExplorer.tsx` — navegação em árvore tipo Drive (breadcrumb + grid de pastas e cards de materiais com thumbnail). Ações: criar/renomear/mover/excluir pasta e material.
  - `MaterialTable.tsx` — tabela com todas as colunas e filtros do briefing, ações Ver/Editar/Mover/Duplicar/Arquivar/Excluir.
  - `MaterialKanban.tsx` — colunas por status com drag & drop (`@dnd-kit`, já usado no projeto) atualizando `status`.
  - `controle/ControleMateriais.tsx`, `ControlePostagens.tsx`, `ControleCriativos.tsx` — 3 sub-abas do Controle Geral, cada uma com tabela específica.
  - `MaterialFormModal.tsx` — formulário completo (upload, tipo, procedimento, área, datas, status, autorização, responsáveis, tags, observações, pasta). Gerador automático de nome no padrão `DATA_PROCEDIMENTO_AREA_TIPO_STATUS`, editável.
  - `MaterialDetailModal.tsx` — preview grande, todos os campos, histórico, ações (editar, mover, arquivar, excluir, marcar como publicado, adicionar ao tráfego).
  - `FolderFormModal.tsx` — nome, pasta pai, procedimento, ordem.
  - `ImportMaterialsModal.tsx` — cadastro/import em lote dos antigos (CSV simples ou múltiplas linhas).
- `hooks/` — `useFolders`, `useMaterials`, `useProcedures`, `useAreas`, `useTags`, `useMaterialHistory`, `usePostings`, `useAdCreatives` (React Query + Supabase).
- `lib/`
  - `nameGenerator.ts` — gera `DATA_PROCEDIMENTO_AREA_TIPO_STATUS` (com `PAC###` quando há código de paciente), normalizando acentos.
  - `statusConfig.ts` — labels/cores dos 13 status + ordem do kanban.
  - `constants.ts` — enums (tipos, plataformas, autorização, ângulos, etc.).

## 4. Regras de negócio

- Materiais em `EM_APROVAÇÃO` ganham botões Aprovar/Reprovar; só `APROVADO` pode ir para `PUBLICADO` ou `USADO_EM_TRÁFEGO`.
- `image_authorization in ('nao','pendente')` ⇒ badge vermelho "Sem autorização" e bloqueio de `can_use_in_ads='sim'`.
- Materiais sem `captured_at` vão automaticamente para a pasta "SEM DATA / ANTIGOS" do procedimento correspondente.
- Validação no client (zod) impede nome real de paciente no campo de nome do arquivo (avisa quando detecta padrão de nome próprio e força uso de `PAC###`).
- Histórico registrado pelo trigger do banco + entradas explícitas pelo frontend para "publicado", "movido", "arquivado".

## 5. Permissões

Roles novos no enum `app_role`: `marketing`, `editor_video`, `comercial`, `visualizador` (somam aos existentes `super_admin`, `admin`, `user`). Helper `has_any_role` para checagens. Políticas usam `has_role` (já existente). Telas escondem ações conforme role.

## 6. Entregáveis (ordem)

1. Migração (tabelas + seeds + bucket + policies + trigger de histórico).
2. Tipos/hooks de dados.
3. Shell da página + roteamento + item de menu.
4. FolderExplorer + FolderFormModal + MaterialFormModal + upload.
5. Tabela + filtros.
6. Kanban.
7. Detalhe + histórico + ações.
8. Controle Geral (3 sub-abas).
9. Dashboard + gráficos.
10. Import em lote.

Vou começar pela migração assim que aprovado.
