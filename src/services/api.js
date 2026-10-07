import axios from 'axios';

// Documentação: https://developers.google.com/books/docs/v1/using
const api = axios.create({
    baseURL: 'https://www.googleapis.com/books/v1/',
    params: {
        // Enviada automaticamente em todas as requisições.
        // No Vite, variáveis do .env começam com VITE_ e são lidas por import.meta.env
        key: import.meta.env.VITE_GOOGLE_BOOKS_KEY,
    },
});

export default api;