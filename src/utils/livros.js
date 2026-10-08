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