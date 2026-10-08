// Leitura e gravação da estante do usuário no Supabase.
// As regras de leitura (datas, progresso) ficam aqui, separadas das telas.

import { supabase } from '../lib/supabase';
import { getAutores, getCapa } from '../utils/livros';

// Os três status possíveis e o texto que aparece na tela
export const STATUS = {
    lendo: 'Lendo',
    para_ler: 'Quero ler',
    lido: 'Lido',
};

// Colunas que o app grava (o resto, como id e datas de criação, o banco preenche sozinho)
const COLUNAS = [
    'livro_id', 'titulo', 'autores', 'capa', 'total_paginas',
    'status', 'favorito', 'nota', 'pagina_atual', 'resenha',
    'iniciado_em', 'concluido_em',
];

// Data de hoje no formato do banco (AAAA-MM-DD), no fuso do usuário
function hoje() {
    return new Date().toLocaleDateString('sv-SE');
}

// Converte um livro da API do Google Books nos dados básicos da estante
export function livroParaItem(livro) {
    const info = livro.volumeInfo ?? {};

    return {
        livro_id: livro.id,
        titulo: info.title ?? 'Sem título',
        autores: getAutores(info) || null,
        capa: getCapa(info) ?? null,
        total_paginas: info.pageCount > 0 ? info.pageCount : null,
    };
}

// Porcentagem lida (0 a 100) ou null se não sabemos o total de páginas
export function getProgresso(item) {
    if (!item?.total_paginas) return null;
    return Math.min(100, Math.round((item.pagina_atual / item.total_paginas) * 100));
}

// Aplica as regras de leitura ao combinar o estado atual com as mudanças
export function aplicarRegras(atual, mudancas) {
    // 1. Começa com valores padrão, por cima o estado atual, por cima as mudanças
    const novo = {
        status: null,
        favorito: false,
        nota: null,
        pagina_atual: 0,
        resenha: null,
        iniciado_em: null,
        concluido_em: null,
        ...atual,
        ...mudancas,
    };

    const total = novo.total_paginas;

    // 2. Página atual sempre entre 0 e o total
    novo.pagina_atual = Math.max(0, Math.round(Number(novo.pagina_atual) || 0));
    if (total) novo.pagina_atual = Math.min(novo.pagina_atual, total);

    // 3. Chegou à última página enquanto lia: marca como lido
    if (total && novo.pagina_atual === total && novo.status === 'lendo' && !('status' in mudancas)) {
        novo.status = 'lido';
    }

    // 4. Começou a ler: registra a data de início
    if (novo.status === 'lendo' && !novo.iniciado_em) {
        novo.iniciado_em = hoje();
    }

    // 5. Terminou: registra as datas e completa as páginas
    if (novo.status === 'lido') {
        novo.iniciado_em ??= hoje();
        novo.concluido_em ??= hoje();
        if (total) novo.pagina_atual = total;
    } else {
        novo.concluido_em = null;
    }

    // 6. Resenha só com espaços conta como vazia
    if (novo.resenha !== null && !String(novo.resenha).trim()) {
        novo.resenha = null;
    }

    return novo;
}

// Um item sem status e sem favorito não precisa ficar salvo
export function itemVazio(item) {
    return !item.status && !item.favorito;
}

// Só as colunas da lista branca
function selecionarColunas(item) {
    return Object.fromEntries(COLUNAS.map((coluna) => [coluna, item[coluna] ?? null]));
}

// Todos os livros do usuário logado, os mais recentes primeiro
export async function listarEstante() {
    const { data, error } = await supabase
        .from('estante')
        .select('*')
        .order('atualizado_em', { ascending: false });

    if (error) throw error;
    return data;
}

// Cria ou atualiza o livro na estante
export async function salvarItem(userId, item) {
    const { data, error } = await supabase
        .from('estante')
        .upsert({ ...selecionarColunas(item), user_id: userId }, { onConflict: 'user_id,livro_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Remove o livro da estante do usuário logado
export async function removerItem(livroId) {
    const { error } = await supabase.from('estante').delete().eq('livro_id', livroId);
    if (error) throw error;
}