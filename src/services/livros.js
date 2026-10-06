// Busca de livros na API, com cache para economizar a cota do Google Books.
// O cache fica no sessionStorage: sobrevive a recarregar a página,
// mas é apagado ao fechar a aba.

import api from './api';
import { filtrarLivros } from '../utils/livros';

const PREFIXO = 'livraria-cache:';
const VALIDADE = 10 * 60 * 1000; // 10 minutos

function lerCache(chave) {
    try {
        const salvo = JSON.parse(sessionStorage.getItem(PREFIXO + chave));
        if (salvo && Date.now() - salvo.data < VALIDADE) {
            return salvo.valor;
        }
    } catch {
        // Cache inválido: ignora e busca na API
    }
    return null;
}

function limparCache() {
    Object.keys(sessionStorage)
        .filter((chave) => chave.startsWith(PREFIXO))
        .forEach((chave) => sessionStorage.removeItem(chave));
}

function salvarCache(chave, valor) {
    try {
        sessionStorage.setItem(PREFIXO + chave, JSON.stringify({ data: Date.now(), valor }));
    } catch {
        // sessionStorage cheio: apaga o cache antigo e segue sem guardar
        limparCache();
    }
}

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