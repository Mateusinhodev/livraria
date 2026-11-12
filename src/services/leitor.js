// Leitor de clássicos: baixa o texto pela Edge Function e o prepara para leitura.

import { supabase } from '../lib/supabase';

// Cache em memória: id → texto.
// Fica guardado enquanto a aba estiver aberta (some ao recarregar a página).
const textos = new Map();

export async function baixarTexto(id) {
    if (textos.has(id)) return textos.get(id);

    const { data, error } = await supabase.functions.invoke('texto-livro', {
        body: { id: Number(id) },
    });

    if (error) {
        const erro = new Error(error.message);
        erro.status = error.context?.status; // 400, 404, 502... (o código que a função devolveu)
        throw erro;
    }

    textos.set(id, data);
    return data;
}

// Marcas que delimitam o livro dentro do arquivo do Gutenberg
const INICIO = /\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i;
const FIM = /\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK/i;

// Texto bruto → { titulo, autor, paragrafos }
export function prepararLivro(textoBruto) {
    // Windows usa \r\n para quebrar linha; padronizamos para \n
    const texto = textoBruto.replace(/\r\n/g, '\n');

    // 1. Separa o cabeçalho do corpo do livro
    const posicaoInicio = texto.search(INICIO);
    const cabecalho = posicaoInicio >= 0 ? texto.slice(0, posicaoInicio) : '';
    let corpo = posicaoInicio >= 0 ? texto.slice(posicaoInicio).replace(INICIO, '') : texto;

    // 2. Corta o rodapé de licença
    const posicaoFim = corpo.search(FIM);
    if (posicaoFim >= 0) corpo = corpo.slice(0, posicaoFim);

    // 3. Título e autor, lidos do cabeçalho
    const titulo = cabecalho.match(/^Title:\s*(.+)$/m)?.[1].trim() ?? 'Livro sem título';
    const autor = cabecalho.match(/^Author:\s*(.+)$/m)?.[1].trim() ?? '';

    // 4. Parágrafos: separados por linha em branco; dentro de cada um, junta as linhas
    const paragrafos = corpo
        .split(/\n\s*\n/)
        .map((paragrafo) => paragrafo.replace(/\s*\n\s*/g, ' ').trim())
        .filter(Boolean);

    return { titulo, autor, paragrafos };
}

// Agrupa os parágrafos em páginas de ~3.000 caracteres (sem cortar parágrafos ao meio)
export function dividirEmPaginas(paragrafos, tamanho = 3000) {
    const paginas = [];
    let atual = [];
    let caracteres = 0;

    for (const paragrafo of paragrafos) {
        // Se este parágrafo não cabe na página atual, fecha a página e começa outra
        if (caracteres > 0 && caracteres + paragrafo.length > tamanho) {
            paginas.push(atual);
            atual = [];
            caracteres = 0;
        }
        atual.push(paragrafo);
        caracteres += paragrafo.length;
    }

    if (atual.length > 0) paginas.push(atual); // a última página

    return paginas; // [[parágrafos da pág. 1], [parágrafos da pág. 2], ...]
}