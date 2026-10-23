-- Uma linha por usuário por dia em que houve leitura
create or replace view public.dias_leitura
with (security_invoker = true) as
select
    user_id,
    lido_em,
    sum(paginas)::int as paginas,
    count(distinct livro_id)::int as livros
from public.historico_leitura
group by user_id, lido_em;