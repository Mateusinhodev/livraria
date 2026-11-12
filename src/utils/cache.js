// Cache simples no sessionStorage: sobrevive a recarregar a página,
// mas é apagado ao fechar a aba. Usado pelos services de livros e de clássicos.

const PREFIXO = 'livraria-cache:';
const VALIDADE_PADRAO = 10 * 60 * 1000; // 10 minutos

// Devolve o valor guardado, ou null se não existir ou estiver vencido
export function lerCache(chave, validade = VALIDADE_PADRAO) {
    try {
        const salvo = JSON.parse(sessionStorage.getItem(PREFIXO + chave));
        if (salvo && Date.now() - salvo.data < validade) {
            return salvo.valor;
        }
    } catch {
        // Cache inválido: ignora e busca de novo
    }
    return null;
}

function limparCache() {
    Object.keys(sessionStorage)
        .filter((chave) => chave.startsWith(PREFIXO))
        .forEach((chave) => sessionStorage.removeItem(chave));
}

export function salvarCache(chave, valor) {
    try {
        sessionStorage.setItem(PREFIXO + chave, JSON.stringify({ data: Date.now(), valor }));
    } catch {
        // sessionStorage cheio: apaga o cache antigo e segue sem guardar
        limparCache();
    }
}