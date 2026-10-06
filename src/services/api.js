import axios from 'axios';

// Documentação: https://developers.google.com/books/docs/v1/using
const api = axios.create({
    baseURL: 'https://www.googleapis.com/books/v1/',
    params: {
        // Enviada automaticamente em todas as requisições
        key: process.env.REACT_APP_GOOGLE_BOOKS_KEY,
    },
});

export default api;