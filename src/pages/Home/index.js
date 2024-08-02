import { useEffect, useState } from 'react';
import api from '../../services/api'


// URL da API:  https://www.googleapis.com/books/v1/volumes?q=flowers&filter=free-ebooks&key=yourAPIKey
// Configurada para o REACT: https://www.googleapis.com/books/v1/volumes?q=react&key=AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ


function Home() {
    const [livros, setLivros] = useState([]);

    useEffect(() => {
        async function loadLivros() {
            const response = await api.get("https://www.googleapis.com/books/v1/volumes?q=react&key", {
                params: {
                    api_key: "AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ",
                    language:"pt-BR",
                }
            })

            console.log(response.data.items)
        }

        loadLivros();

    }, [])

    return (
        <div>
            <h1>Bem vindo a HOME</h1>
        </div>
    )
}

export default Home;