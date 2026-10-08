-- PARTE A: a tabela (só cria se ainda não existir)
create table if not exists public.estante (
    id             uuid primary key default gen_random_uuid(),
    user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
    livro_id       text not null,
    titulo         text not null,
    autores        text,
    capa           text,
    total_paginas  integer check (total_paginas is null or total_paginas > 0),
    status         text check (status in ('para_ler', 'lendo', 'lido')),
    favorito       boolean not null default false,
    nota           smallint check (nota between 1 and 5),
    pagina_atual   integer not null default 0 check (pagina_atual >= 0),
    resenha        text check (char_length(resenha) <= 10000),
    iniciado_em    date,
    concluido_em   date,
    criado_em      timestamptz not null default now(),
    atualizado_em  timestamptz not null default now(),
    unique (user_id, livro_id)
);

-- PARTE B: segurança (apaga e recria cada regra)
alter table public.estante enable row level security;

drop policy if exists "Ver a própria estante" on public.estante;
create policy "Ver a própria estante" on public.estante
    for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Adicionar na própria estante" on public.estante;
create policy "Adicionar na própria estante" on public.estante
    for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Editar a própria estante" on public.estante;
create policy "Editar a própria estante" on public.estante
    for update to authenticated
    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Remover da própria estante" on public.estante;
create policy "Remover da própria estante" on public.estante
    for delete to authenticated using ((select auth.uid()) = user_id);

-- PARTE C: atualiza "atualizado_em" a cada alteração
create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin
    new.atualizado_em = now();
    return new;
end;
$$;

drop trigger if exists estante_atualizado_em on public.estante;
create trigger estante_atualizado_em
    before update on public.estante
    for each row execute function public.tocar_atualizado_em();