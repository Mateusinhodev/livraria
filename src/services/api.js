import axios from 'axios'

// Base da URL: https://www.googleapis.com/books/v1/volumes
// URL da API:  https://www.googleapis.com/books/v1/volumes?q=react&key=AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ

const api =  axios.create({
    baseURL: 'https://www.googleapis.com/books/v1/volumes?q=books&key'
});

export default api;