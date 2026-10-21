-- ============================================================
-- Diário de leitura: uma linha para cada avanço de páginas
-- ============================================================

create table if not exists public.historico_leitura (
    id          bigint generated always as identity primary key,
    user_id     uuid not null references auth.users (id) on delete cascade,
    livro_id    text not null,
    paginas     integer not null check (paginas > 0),
    lido_em     date not null default (now() at time zone 'America/Sao_Paulo')::date,
    criado_em   timestamptz not null default now()
);

create index if not exists historico_leitura_user_data_idx
    on public.historico_leitura (user_id, lido_em);

-- Segurança: cada pessoa só LÊ o próprio diário. Ninguém escreve direto.
alter table public.historico_leitura enable row level security;

drop policy if exists "Ver o próprio histórico" on public.historico_leitura;
create policy "Ver o próprio histórico" on public.historico_leitura
    for select to authenticated using ((select auth.uid()) = user_id);

-- ============================================================
-- Gatilho: anota no diário quando a página atual avança
-- ============================================================

create or replace function public.registrar_leitura()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    pagina_anterior integer := 0;
    status_anterior text := null;
begin
    if tg_op = 'UPDATE' then
        pagina_anterior := coalesce(old.pagina_atual, 0);
        status_anterior := old.status;
    end if;

    -- Só conta leitura de verdade: lendo agora, ou terminando um livro que estava lendo
    if new.pagina_atual > pagina_anterior
       and (new.status = 'lendo' or (new.status = 'lido' and status_anterior = 'lendo')) then
        insert into public.historico_leitura (user_id, livro_id, paginas)
        values (new.user_id, new.livro_id, new.pagina_atual - pagina_anterior);
    end if;

    return new;
end;
$$;

drop trigger if exists estante_registrar_leitura on public.estante;
create trigger estante_registrar_leitura
    after insert or update of pagina_atual on public.estante
    for each row execute function public.registrar_leitura();