// Catálogo de clássicos em domínio público (Project Gutenberg), via Gutendex.
// O Gutendex é gratuito, mas lento e às vezes instável: por isso o cache longo.

import { lerCache, salvarCache } from '../utils/cache';

const BASE = 'https://gutendex.com/books/';
const UMA_HORA = 60 * 60 * 1000;
export const POR_PAGINA = 32; // o Gutendex sempre devolve até 32 livros por página

// O Gutenberg guarda os nomes como "Assis, Machado de" → "Machado de Assis"
function inverterNome(nome) {
    const [sobrenome, resto] = nome.split(', ');
    return resto ? `${resto} ${sobrenome}` : sobrenome;
}

// Adaptador: o formato do Gutendex → o formato que o nosso app usa
function normalizar(livro) {
    return {
        id: livro.id,
        titulo: livro.title,
        autores: livro.authors.map((autor) => inverterNome(autor.name)).join(', '),
        capa: livro.formats['image/jpeg'] ?? null,
    };
}

// Uma página do catálogo em português (com busca opcional)
export async function listarClassicos({ busca = '', pagina = 1, signal } = {}) {
    const termo = busca.trim().toLowerCase();
    const chave = `classicos:${termo}:${pagina}`;

    const emCache = lerCache(chave, UMA_HORA);
    if (emCache) return emCache;

    const params = new URLSearchParams({
        languages: 'pt',
        mime_type: 'text/plain', // só livros que têm o texto (o leitor precisa dele)
        page: String(pagina),
    });
    if (termo) params.set('search', termo);

    const resposta = await fetch(`${BASE}?${params}`, { signal });

    // O fetch NÃO lança erro em respostas 404 ou 500: precisamos conferir
    if (!resposta.ok) {
        const erro = new Error(`O Gutendex respondeu com o status ${resposta.status}`);
        erro.status = resposta.status;
        throw erro;
    }

    const dados = await resposta.json();

    const resultado = {
        total: dados.count,
        livros: dados.results.map(normalizar),
    };

    salvarCache(chave, resultado);
    return resultado;
}

export function getMensagemErroClassicos(error) {
    if (error.status === 404) return 'Esta página do catálogo não existe.';
    return 'O catálogo de clássicos está instável no momento. Aguarde alguns instantes e tente novamente.';
}