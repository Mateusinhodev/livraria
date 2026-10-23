// Estatísticas de leitura: transforma a estante e o diário em números.
// Quase tudo aqui são funções puras: recebem listas e devolvem números.

import { supabase } from '../lib/supabase';

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Linhas do diário de leitura de um ano (só as do usuário logado, pelo RLS)
export async function listarHistorico(ano) {
    const { data, error } = await supabase
        .from('historico_leitura')
        .select('livro_id, paginas, lido_em')
        .gte('lido_em', `${ano}-01-01`)
        .lte('lido_em', `${ano}-12-31`)
        .order('lido_em');

    if (error) throw error;
    return data;
}

// Livros concluídos num ano (pela data de conclusão)
export function lidosNoAno(itens, ano) {
    return itens.filter(
        (item) => item.status === 'lido' && item.concluido_em?.slice(0, 4) === String(ano)
    );
}

// Quantos livros foram concluídos em cada mês: [jan, fev, ..., dez]
export function livrosPorMes(lidos) {
    return lidos.reduce((meses, item) => {
        const mes = Number(item.concluido_em.slice(5, 7)) - 1; // '10' → 9 (outubro)
        meses[mes] += 1;
        return meses;
    }, Array(12).fill(0));
}

// Média das notas (só dos livros que têm nota), ou null se nenhum tiver
export function notaMedia(itens) {
    const comNota = itens.filter((item) => item.nota);
    if (comNota.length === 0) return null;

    const soma = comNota.reduce((total, item) => total + item.nota, 0);
    return soma / comNota.length;
}

// O livro com a maior nota (em caso de empate, o concluído mais recentemente)
export function melhorLivro(itens) {
    return itens
        .filter((item) => item.nota)
        .reduce((melhor, item) => {
            if (!melhor) return item;
            if (item.nota > melhor.nota) return item;
            if (item.nota === melhor.nota && item.concluido_em > melhor.concluido_em) return item;
            return melhor;
        }, null);
}

// Autores mais lidos: [{ nome, livros }], do mais lido para o menos
export function autoresFavoritos(lidos, limite = 3) {
    const contagem = lidos.reduce((porAutor, item) => {
        // "Ana Silva, João Souza" → cada autor conta separadamente
        for (const nome of (item.autores ?? '').split(', ').filter(Boolean)) {
            porAutor[nome] = (porAutor[nome] ?? 0) + 1;
        }
        return porAutor;
    }, {});

    return Object.entries(contagem)
        .map(([nome, livros]) => ({ nome, livros }))
        .sort((a, b) => b.livros - a.livros)
        .slice(0, limite);
}

// Todos os números do ano num único objeto
export function resumoDoAno(itens, historico, ano) {
    const lidos = lidosNoAno(itens, ano);

    return {
        ano,
        livrosLidos: lidos.length,
        paginasLidas: historico.reduce((total, linha) => total + linha.paginas, 0),
        diasLendo: new Set(historico.map((linha) => linha.lido_em)).size,
        porMes: livrosPorMes(lidos),
        notaMedia: notaMedia(lidos),
        melhorLivro: melhorLivro(lidos),
        autoresFavoritos: autoresFavoritos(lidos),
    };
}

// ---------- Meta anual ----------

// A meta do ano (ou null se não houver).
// Não filtramos por usuário: a RLS já devolve só as linhas da pessoa logada.
export async function buscarMeta(ano) {
    const { data, error } = await supabase
        .from('metas_leitura')
        .select('livros')
        .eq('ano', ano)
        .maybeSingle();

    if (error) throw error;
    return data?.livros ?? null;
}

// Cria ou atualiza (upsert) a meta do ano
export async function salvarMeta(userId, ano, livros) {
    const { error } = await supabase
        .from('metas_leitura')
        .upsert(
            { user_id: userId, ano, livros, atualizado_em: new Date().toISOString() },
            { onConflict: 'user_id,ano' }
        );

    if (error) throw error;
}

export async function removerMeta(ano) {
    const { error } = await supabase.from('metas_leitura').delete().eq('ano', ano);
    if (error) throw error;
}

const DIA = 24 * 60 * 60 * 1000; // um dia em milissegundos

// Compara o que foi lido com o que a meta "pede" até hoje.
// "hoje" é um parâmetro para podermos testar com qualquer data.
export function ritmoDaMeta(meta, lidos, ano, hoje = new Date()) {
    const anoAtual = hoje.getFullYear();

    // Date.UTC conta dias "puros", sem fuso nem horário de verão
    const inicio = Date.UTC(ano, 0, 1);
    const fim = Date.UTC(ano + 1, 0, 1);
    const totalDias = (fim - inicio) / DIA; // 365 ou 366

    let diasPassados; // contando hoje
    if (ano < anoAtual) diasPassados = totalDias;
    else if (ano > anoAtual) diasPassados = 0;
    else diasPassados = (Date.UTC(ano, hoje.getMonth(), hoje.getDate()) - inicio) / DIA + 1;

    const fracaoAno = diasPassados / totalDias;
    const esperado = Math.floor(meta * fracaoAno);
    const faltam = Math.max(meta - lidos, 0);
    const diasRestantes = ano < anoAtual ? 0 : totalDias - diasPassados + 1; // hoje ainda conta

    let situacao;
    if (lidos >= meta) situacao = 'concluida';
    else if (diasRestantes === 0) situacao = 'encerrada';
    else if (lidos > esperado) situacao = 'adiantado';
    else if (lidos === esperado) situacao = 'no-ritmo';
    else situacao = 'atrasado';

    return {
        meta,
        lidos,
        percentual: Math.min(lidos / meta, 1),
        fracaoAno,
        esperado,
        diferenca: lidos - esperado,
        faltam,
        diasRestantes,
        situacao,
    };
}

// ---------- Sequência de leitura ----------

// Todos os dias em que houve leitura, do mais recente para o mais antigo
export async function listarDiasDeLeitura() {
    const { data, error } = await supabase
        .from('dias_leitura')
        .select('lido_em')
        .order('lido_em', { ascending: false })
        .limit(1000);

    if (error) throw error;
    return data.map((linha) => linha.lido_em);
}

// 'AAAA-MM-DD' → número do dia (dias consecutivos viram números consecutivos)
function numeroDoDia(texto) {
    const [ano, mes, dia] = texto.split('-').map(Number);
    return Date.UTC(ano, mes - 1, dia) / DIA;
}

export function sequenciaDeLeitura(dias, hoje = new Date()) {
    const numeros = new Set(dias.map(numeroDoDia));
    const hojeN = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) / DIA;

    // Sequência atual: conta para trás a partir de hoje.
    // Se ainda não leu hoje, a sequência não quebrou: o dia não acabou. Conta a partir de ontem.
    const leuHoje = numeros.has(hojeN);
    let dia = leuHoje ? hojeN : hojeN - 1;
    let atual = 0;
    while (numeros.has(dia)) {
        atual++;
        dia--;
    }

    // Recorde: a maior "corrida" de dias seguidos em todo o diário
    let recorde = 0;
    for (const n of numeros) {
        if (numeros.has(n - 1)) continue; // não é o começo de uma corrida
        let tamanho = 1;
        while (numeros.has(n + tamanho)) tamanho++;
        recorde = Math.max(recorde, tamanho);
    }

    return { atual, recorde, leuHoje };
}