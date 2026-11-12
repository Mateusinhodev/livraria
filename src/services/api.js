import axios from 'axios';

// Documentação: https://developers.google.com/books/docs/v1/using
const api = axios.create({
    baseURL: 'https://www.googleapis.com/books/v1/',
    params: {
        // Enviada automaticamente em todas as requisições
        key: import.meta.env.VITE_GOOGLE_BOOKS_KEY,
    },
});

// ------------------------------------------------------------
// Tentar de novo em erros temporários do servidor (retry com backoff)
// ------------------------------------------------------------
const STATUS_TEMPORARIOS = [500, 502, 503, 504];
const MAX_TENTATIVAS = 3;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
    // Deu certo: a resposta segue normalmente
    (resposta) => resposta,

    // Deu erro: decide se vale tentar de novo
    async (erro) => {
        const config = erro.config;
        const status = erro.response?.status;

        // Não tenta de novo se a busca foi cancelada ou se o erro não é temporário
        if (!config || axios.isCancel(erro) || !STATUS_TEMPORARIOS.includes(status)) {
            throw erro;
        }

        config.tentativa = (config.tentativa ?? 0) + 1;
        if (config.tentativa > MAX_TENTATIVAS) {
            throw erro; // já tentou demais: desiste e mostra o erro
        }

        // Espera 0,5s, depois 1s, depois 2s (dobrando a cada tentativa)
        await esperar(500 * 2 ** (config.tentativa - 1));

        // Se a pessoa pesquisou outra coisa enquanto esperávamos, não insiste
        if (config.signal?.aborted) throw erro;

        return api(config); // repete exatamente a mesma requisição
    }
);

export default api;