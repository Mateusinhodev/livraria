// Funções auxiliares para lidar com os dados que vêm da API do Google Books.
// Usadas pela Home, pela página Livro e pelos Favoritos.

// A API às vezes envia links em http; o navegador pode bloquear em sites https
export function forcarHttps(url) {
    return url?.replace(/^http:\/\//, 'https://');
}

// Retorna a URL da capa.
// Usamos sempre a "thumbnail": as versões maiores do Google Books às vezes
// mostram a folha de rosto digitalizada em vez da capa.
export function getCapa(volumeInfo) {
    const imagens = volumeInfo?.imageLinks;
    const url = imagens?.thumbnail || imagens?.smallThumbnail;
    if (!url) return undefined;

    // edge=curl desenha uma "orelha" dobrada no canto da imagem; removemos
    return forcarHttps(url).replace('&edge=curl', '');
}

// ["Ana", "João"] → "Ana, João"
export function getAutores(volumeInfo) {
    return volumeInfo?.authors?.join(', ') || '';
}

// Mantém só livros com capa e remove ids repetidos (a API às vezes duplica)
export function filtrarLivros(items) {
    const vistos = new Set();

    return items.filter((livro) => {
        if (!getCapa(livro.volumeInfo) || vistos.has(livro.id)) return false;
        vistos.add(livro.id);
        return true;
    });
}

// A sinopse vem da API com HTML (<p>, <b>, <br>...).
// Convertemos para texto puro, mantendo as quebras de parágrafo.
export function limparDescricao(html) {
    if (!html) return '';

    const comQuebras = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n');

    const doc = new DOMParser().parseFromString(comQuebras, 'text/html');
    return doc.body.textContent.trim();
}

// ISBN do livro (prefere o de 13 dígitos, que é o padrão atual)
export function getIsbn(volumeInfo) {
    const identificadores = volumeInfo?.industryIdentifiers ?? [];
    const isbn =
        identificadores.find((item) => item.type === 'ISBN_13') ??
        identificadores.find((item) => item.type === 'ISBN_10');
    return isbn?.identifier ?? null;
}

// // Capa da Open Library pelo ISBN (S = pequena, M = média, L = grande)
// export function getCapaOpenLibrary(volumeInfo, tamanho = 'L') {
//     const isbn = getIsbn(volumeInfo);
//     if (!isbn) return null;
//     // default=false: sem capa, a Open Library responde 404 (em vez de uma imagem em branco)
//     return `https://covers.openlibrary.org/b/isbn/${isbn}-${tamanho}.jpg?default=false`;
// }

// Divide um bloco em parágrafos de até "porParagrafo" frases.
// Uma frase termina em . ! ? ou … seguido de espaço e letra maiúscula.
function agruparFrases(bloco, porParagrafo = 3) {
    const frases = bloco.split(/(?<=[.!?…])\s+(?=[A-ZÀ-Ý])/);
    const paragrafos = [];

    for (let i = 0; i < frases.length; i += porParagrafo) {
        paragrafos.push(frases.slice(i, i + porParagrafo).join(' '));
    }

    return paragrafos;
}

// Sinopses sem quebras de linha viram um "paredão" de texto.
// Criamos parágrafos depois de estrelas, antes de citações e a cada 3 frases.
export function separarParagrafos(texto) {
    if (!texto || texto.includes('\n')) return texto; // já tem parágrafos: respeita

    return texto
        .replace(/((?:⭐\uFE0F?|★)+)\s*/g, '$1\n') // quebra depois de uma fileira de estrelas
        .replace(/\s+(?=“)/g, '\n') // quebra antes de abrir aspas
        .split('\n')
        .flatMap((bloco) => agruparFrases(bloco.trim()))
        .filter(Boolean)
        .join('\n\n');
}