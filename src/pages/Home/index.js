import { useEffect, useState } from 'react';
import api from '../../services/api'
import { Link } from 'react-router-dom';

import Main from '../../components/Main';

import './home.css'

// URL da API:  https://www.googleapis.com/books/v1/volumes?q=flowers&filter=free-ebooks&key=yourAPIKey
// Configurada para o REACT: https://www.googleapis.com/books/v1/volumes?q=react&key=AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ


function Home() {
    const [livros, setLivros] = useState([]);

    useEffect(() => {
        async function loadLivros() {
            const response = await api.get("https://www.googleapis.com/books/v1/volumes?q=livros&maxResults=40", {
                params: {
                    api_key: "AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ",
                    language:"pt-BR",
                }
            })

            console.log(response.data.items.slice(0, 40))

            setLivros(response.data.items.slice(0, 40))
        }

        loadLivros();

    }, [])

    return (
        <div className='container'>
            <Main/>
            <div className='lista-livros'>
                {livros.map((livro) => {
                    let thumbnail = livro.volumeInfo.imageLinks && livro.volumeInfo.imageLinks.smallThumbnail || "placeholder.jpg";
                    return(
                        <article className='card-livro' key={livro.id}>
                            <strong title={livro.volumeInfo.title}>{livro.volumeInfo.title}</strong>
                            <div>
                                <img src={thumbnail}/>
                            </div>
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