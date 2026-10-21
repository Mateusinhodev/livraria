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