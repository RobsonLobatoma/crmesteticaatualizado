-- Create leads table as single source of truth for all lead-related features

-- 1) Helper function to keep updated_at in sync
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- 2) Main leads table
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Core lead fields (espelham o modelo atual em src/modules/leads-v2/types/Lead.ts)
  data text,
  responsavel text,
  nome text not null,
  contato text not null,
  origem text,
  procedimento text,
  status text not null default 'Novo lead',
  data_entrada text,
  data_ultimo_contato text,
  data_agendamento text,
  data_avaliacao text,
  compareceu text,
  data_fechamento text,
  valor_fechado text,
  observacao text
);

-- 3) Trigger para updated_at
create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.update_updated_at_column();

-- 4) Habilitar RLS
alter table public.leads enable row level security;

-- 5) Políticas básicas de acesso por usuário autenticado
create policy "Leads are viewable by owner" 
  on public.leads
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Leads are insertable by owner" 
  on public.leads
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Leads are updatable by owner" 
  on public.leads
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Leads are deletable by owner" 
  on public.leads
  for delete
  to authenticated
  using (auth.uid() = user_id);