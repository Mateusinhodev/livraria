import { useEffect, useState } from 'react';
import api from '../../services/api'
import { Link } from 'react-router-dom';
import './home.css'

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

            setLivros(response.data.items.slice(0,10))
        }

        loadLivros();

    }, [])

    return (
        <div className='container'>
            <div className='lista-livros'>
                {livros.map((livro) => {
                    let thumbnail = livro.volumeInfo.imageLinks && livro.volumeInfo.imageLinks.smallThumbnail;
                    return(
                        <article key={livro.id}>
                            <strong>{livro.volumeInfo.title}</strong>
                            <img src={thumbnail}/>
                            <Link to={`/livro/${livro.id}`}>Acessar</Link>
                        </article>
                    )
                })

                }
            </div>            
        </div>
    )
}

export default Home;