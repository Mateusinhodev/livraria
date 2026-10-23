-- Meta de leitura anual: uma por usuário por ano
create table if not exists public.metas_leitura (
    user_id uuid not null references auth.users (id) on delete cascade,
    ano integer not null check (ano between 2000 and 2100),
    livros integer not null check (livros between 1 and 1000),
    atualizado_em timestamptz not null default now(),
    primary key (user_id, ano)
);

alter table public.metas_leitura enable row level security;

-- Cada um só enxerga e mexe nas próprias metas
drop policy if exists "Ver as próprias metas" on public.metas_leitura;
create policy "Ver as próprias metas" on public.metas_leitura
    for select using (auth.uid() = user_id);

drop policy if exists "Criar as próprias metas" on public.metas_leitura;
create policy "Criar as próprias metas" on public.metas_leitura
    for insert with check (auth.uid() = user_id);

drop policy if exists "Alterar as próprias metas" on public.metas_leitura;
create policy "Alterar as próprias metas" on public.metas_leitura
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Apagar as próprias metas" on public.metas_leitura;
create policy "Apagar as próprias metas" on public.metas_leitura
    for delete using (auth.uid() = user_id);