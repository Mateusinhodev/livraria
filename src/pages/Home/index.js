import { useEffect, useState } from 'react';
import api from '../../services/api'
import { Link } from 'react-router-dom';

import Main from '../../components/Main'; // Importando o Componente Main

import './home.css'

// URL da API:  https://www.googleapis.com/books/v1/volumes?q=flowers&filter=free-ebooks&key=yourAPIKey
// Configurada para o REACT: https://www.googleapis.com/books/v1/volumes?q=react&key=AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ

// 'https://www.googleapis.com/books/v1/volumes'
function Home() {
    const [livros, setLivros] = useState([]); // Todos os livros
    const [searchQuery, setSearchQuery] = useState (""); // Armazena o termo de pesquisa

    const fetchLivros = async (query) =>  {
        try {
            const response = await api.get("https://www.googleapis.com/books/v1/volumes", {
                params: {
                    q: query || 'livros',
                    maxResults: 40,
                    language:"pt-BR",
                    key: "AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ" // Chave de API
                }
                });

            console.log(response.data.items.slice(0, 40))

            setLivros(response.data.items.slice(0, 40))
                
            // Filtrar livros com imagens
            const booksWithImages = response.data.items.filter(
                (book) => book.volumeInfo.imageLinks?.smallThumbnail
            );
        
            setLivros(booksWithImages);
            // setLivrosFiltrados(booksWithImages); // Exibe todos os livros inicialmente

        } catch (error) {
            console.log("Erro ao buscar livros", error);
            setLivros([]); // Em caso de erro, limpa a lista
        }
    };

    // Busca inicial ao carregar o componente
    useEffect(() => {
        fetchLivros(); // Busca geral de livros
    }, []);

    // Atualiza a lista de livros quando o termo de pesquisa muda
    useEffect(() => {
        fetchLivros(searchQuery); // Busca com base no termo digitado
    }, [searchQuery]); // Dependência do termo de pesquisa

    return (
        <div className='container'>
            {/* Passa a função de pesquisa para o componente Main */}
            <Main onSearch={setSearchQuery}/>

            {/* Exibição dos livros */}
            <div className='lista-livros'>
                {livros.map((livro) => {
                    let thumbnail = livro.volumeInfo.imageLinks && livro.volumeInfo.imageLinks.smallThumbnail;
                    //  || "https://via.placeholder.com/128x193.png?text=Sem+Imagem";

                    return(
                        <article className='card-livro' key={livro.id}>
                            <strong title={livro.volumeInfo.title}>{livro.volumeInfo.title}</strong>
                            <div>
                                <img src={thumbnail} alt={livro.volumeInfo.title}/>
                            </div>
                            <Link to={`/livro/${livro.id}`}>Acessar</Link>
                        </article>
                    );
                })}
            </div>            
        </div>
    )
}

export default Home;