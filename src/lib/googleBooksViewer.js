// Carrega o visualizador do Google Books (Embedded Viewer API) sob demanda.
// Documentação: https://developers.google.com/books/docs/viewer/developers_guide

const URL_SCRIPT = 'https://www.google.com/books/jsapi.js';

// Guarda a Promise do carregamento: o script é baixado uma única vez
let carregamento = null;

// Adiciona um <script> na página e avisa quando ele terminar de carregar
function carregarScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Não foi possível carregar o visualizador do Google Books.'));
        document.head.appendChild(script);
    });
}

// Verifica uma condição a cada `intervalo` ms até ela ser verdadeira (ou o tempo acabar)
function esperarAte(condicao, { intervalo = 100, limite = 10000 } = {}) {
    return new Promise((resolve, reject) => {
        const inicio = Date.now();

        function verificar() {
            if (condicao()) return resolve();
            if (Date.now() - inicio > limite) {
                return reject(new Error('O visualizador do Google Books demorou demais para ficar pronto.'));
            }
            setTimeout(verificar, intervalo);
        }

        verificar();
    });
}

export function carregarVisualizador() {
    if (!carregamento) {
        carregamento = carregarScript(URL_SCRIPT)
            .then(() => {
                window.google.books.load({ language: 'pt-BR' });
                // Não usamos o setOnLoadCallback: ele espera o carregamento da PÁGINA,
                // que já aconteceu quando o script é carregado sob demanda.
                return esperarAte(() => typeof window.google?.books?.DefaultViewer === 'function');
            })
            .catch((erro) => {
                carregamento = null; // deu errado: permite tentar de novo depois
                throw erro;
            });
    }
    return carregamento;
}