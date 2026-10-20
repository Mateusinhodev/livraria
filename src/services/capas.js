// Capas em alta resolução pela Open Library.
// Busca o livro (pelo ISBN e, se preciso, pelo título + autor) e usa o id da capa,
// que não tem o limite de requisições das capas por ISBN.

import { lerCache, salvarCache } from '../utils/cache';
import { getIsbn } from '../utils/livros';

const BUSCA = 'https://openlibrary.org/search.json';
const UM_DIA = 24 * 60 * 60 * 1000;

function urlDaCapa(coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

// Faz uma busca na Open Library e devolve a lista de resultados
async function buscarNaOpenLibrary(params) {
    const consulta = new URLSearchParams({ ...params, fields: 'cover_i,language', limit: '10' });
    const resposta = await fetch(`${BUSCA}?${consulta}`);
    if (!resposta.ok) return [];
    const dados = await resposta.json();
    return dados.docs ?? [];
}

// Entre os resultados com capa, prefere um em português
function escolherCapa(resultados) {
    const comCapa = resultados.filter((item) => item.cover_i);
    const emPortugues = comCapa.find((item) => item.language?.includes('por'));
    return (emPortugues ?? comCapa[0])?.cover_i ?? null;
}

// URL da capa em alta resolução, ou null se a Open Library não tiver
export async function buscarCapaAlta(volumeInfo) {
    const isbn = getIsbn(volumeInfo);
    const titulo = volumeInfo?.title;
    const autor = volumeInfo?.authors?.[0];
    const chave = `capa:${isbn ?? ''}:${titulo}:${autor ?? ''}`;

    // Cache: '' significa "já procuramos e não tem" (cache negativo)
    const emCache = lerCache(chave, UM_DIA);
    if (emCache !== null) return emCache || null;

    let coverId = null;
    try {
        if (isbn) {
            coverId = escolherCapa(await buscarNaOpenLibrary({ isbn }));
        }
        if (!coverId && titulo && autor) {
            coverId = escolherCapa(await buscarNaOpenLibrary({ title: titulo, author: autor }));
        }
    } catch {
        return null; // sem internet: não guarda no cache, para tentar de novo depois
    }

    const url = coverId ? urlDaCapa(coverId) : '';
    salvarCache(chave, url);
    return url || null;
}