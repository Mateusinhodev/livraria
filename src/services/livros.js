// Busca de livros na API, com cache para economizar a cota do Google Books.
// O cache fica no sessionStorage: sobrevive a recarregar a página,
// mas é apagado ao fechar a aba.

import api from './api';
import { filtrarLivros } from '../utils/livros';
import { lerCache, salvarCache } from '../utils/cache';

// Lista de livros para a Home
export async function buscarLivros(termo, { signal } = {}) {
    const q = termo.trim().toLowerCase() || 'livros';
    const chave = `busca:${q}`;

    const emCache = lerCache(chave);
    if (emCache) return emCache;

    const response = await api.get('volumes', {
        params: {
            q,
            maxResults: 40,
            langRestrict: 'pt',
            printType: 'books',
        },
        signal,
    });

    // Quando não há resultados, a API não envia "items"
    const livros = filtrarLivros(response.data.items ?? []);
    salvarCache(chave, livros);
    return livros;
}

// Detalhes de um livro para a página Livro
export async function buscarLivro(id, { signal } = {}) {
    const chave = `livro:${id}`;

    const emCache = lerCache(chave);
    if (emCache) return emCache;

    const response = await api.get(`volumes/${id}`, { signal });
    salvarCache(chave, response.data);
    return response.data;
}

// Traduz o erro da requisição em uma mensagem para o usuário
export function getMensagemErro(error) {
    const status = error.response?.status;

    if (status === 429) {
        return 'Muitas buscas em pouco tempo. Aguarde alguns instantes e tente novamente.';
    }
    if (status === 404) {
        return 'Livro não encontrado.';
    }
    if (!error.response) {
        return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
    }
    return 'Não foi possível carregar os livros. Tente novamente mais tarde.';
}