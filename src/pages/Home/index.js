import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import Banner from '../../components/Banner';

import './home.css';

// Retorna a capa do livro (a API às vezes envia em http, então forçamos https)
function getCapa(livro) {
    const imagens = livro.volumeInfo.imageLinks;
    const url = imagens?.thumbnail || imagens?.smallThumbnail;
    return url?.replace('http://', 'https://');
}

// Mantém só livros com capa e remove ids repetidos (a API às vezes duplica)
function filtrarLivros(items) {
    const vistos = new Set();
    return items.filter((livro) => {
        if (!getCapa(livro) || vistos.has(livro.id)) return false;
        vistos.add(livro.id);
        return true;
    });
}

function Home() {
    const [livros, setLivros] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);

    // Roda ao abrir a página e sempre que o termo de pesquisa muda
    useEffect(() => {
        const controller = new AbortController();

        async function fetchLivros() {
            setLoading(true);
            setErro(false);

            try {
                const response = await api.get('volumes', {
                    params: {
                        q: searchQuery || 'livros',
                        maxResults: 40,
                        langRestrict: 'pt',
                        printType: 'books',
                    },
                    signal: controller.signal,
                });

                // Quando não há resultados, a API não envia "items"
                setLivros(filtrarLivros(response.data.items ?? []));
                setLoading(false);
            } catch (error) {
                // Busca cancelada porque o usuário pesquisou outra coisa: ignora
                if (controller.signal.aborted) return;

                console.error('Erro ao buscar livros', error);
                setErro(true);
                setLivros([]);
                setLoading(false);
            }
        }

        fetchLivros();

        return () => controller.abort();
    }, [searchQuery]);

    return (
        <div className="home">
            <Banner onSearch={setSearchQuery} />

            {loading && <p className="home__aviso">Carregando livros...</p>}

            {!loading && erro && (
                <p className="home__aviso">
                    Não foi possível carregar os livros. Tente novamente mais tarde.
                </p>
            )}

            {!loading && !erro && livros.length === 0 && (
                <p className="home__aviso">
                    Nenhum livro encontrado{searchQuery && ` para "${searchQuery}"`}.
                </p>
            )}

            {!loading && livros.length > 0 && (
                <ul className="lista-livros">
                    {livros.map((livro) => {
                        const { title, authors } = livro.volumeInfo;

                        return (
                            <li key={livro.id}>
                                <article className="card-livro">
                                    <img
                                        className="card-livro__capa"
                                        src={getCapa(livro)}
                                        alt={`Capa do livro ${title}`}
                                        loading="lazy"
                                    />

                                    <h3 className="card-livro__titulo" title={title}>
                                        {title}
                                    </h3>

                                    {authors && (
                                        <p className="card-livro__autor">{authors.join(', ')}</p>
                                    )}

                                    <Link className="card-livro__botao" to={`/livro/${livro.id}`}>
                                        Ver detalhes
                                    </Link>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default Home;