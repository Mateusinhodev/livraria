// Centraliza o acesso aos favoritos salvos no localStorage.
// As páginas Livro e Favoritos e o Header usam as mesmas funções.

const CHAVE = '@livraria';
const EVENTO = 'favoritos-atualizados';

export function getFavoritos() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE)) || [];
    } catch {
        // Dado corrompido no localStorage: começa do zero em vez de quebrar a página
        return [];
    }
}

// Salva a lista e avisa quem estiver "ouvindo" (ex.: o contador do Header)
function salvarFavoritos(lista) {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
    window.dispatchEvent(new Event(EVENTO));
}

export function isFavorito(id) {
    return getFavoritos().some((livro) => livro.id === id);
}

export function adicionarFavorito(livro) {
    const favoritos = getFavoritos();

    if (favoritos.some((item) => item.id === livro.id)) {
        return false;
    }

    salvarFavoritos([...favoritos, livro]);
    return true;
}

export function removerFavorito(id) {
    salvarFavoritos(getFavoritos().filter((livro) => livro.id !== id));
}

// Executa o callback sempre que os favoritos mudarem:
// nesta aba (evento próprio) ou em outra aba do navegador (evento "storage").
// Retorna uma função para parar de ouvir.
export function onFavoritosChange(callback) {
    const handleStorage = (evt) => {
        if (evt.key === CHAVE) callback();
    };

    window.addEventListener(EVENTO, callback);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener(EVENTO, callback);
        window.removeEventListener('storage', handleStorage);
    };
}