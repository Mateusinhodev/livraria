// Funções auxiliares para lidar com os dados que vêm da API do Google Books.
// Usadas pela Home, pela página Livro e pelos Favoritos.

// A API às vezes envia links em http; o navegador pode bloquear em sites https
export function forcarHttps(url) {
    return url?.replace(/^http:\/\//, 'https://');
}

// Retorna a URL da capa. Com { grande: true }, tenta a maior resolução disponível.
export function getCapa(volumeInfo, { grande = false } = {}) {
    const imagens = volumeInfo?.imageLinks;
    if (!imagens) return undefined;

    const url = grande
        ? imagens.medium || imagens.small || imagens.thumbnail || imagens.smallThumbnail
        : imagens.thumbnail || imagens.smallThumbnail;

    return forcarHttps(url);
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