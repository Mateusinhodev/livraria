import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Banner from '../../components/Banner';
import { buscarLivros, getMensagemErro } from '../../services/livros';
import { getCapa, getAutores } from '../../utils/livros';

import './home.css';

function Home() {
    const [livros, setLivros] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [tentativa, setTentativa] = useState(0); // muda ao clicar em "Tentar novamente"

    // Roda ao abrir a página, quando o termo muda ou ao tentar de novo
    useEffect(() => {
        const controller = new AbortController();

        async function carregar() {
            setLoading(true);
            setErro('');

            try {
                const resultado = await buscarLivros(searchQuery, { signal: controller.signal });
                setLivros(resultado);
                setLoading(false);
            } catch (error) {
                // Busca cancelada porque o usuário pesquisou outra coisa: ignora
                if (controller.signal.aborted) return;

                console.error('Erro ao buscar livros', error);
                setErro(getMensagemErro(error));
                setLivros([]);
                setLoading(false);
            }
        }

        carregar();

        return () => controller.abort();
    }, [searchQuery, tentativa]);

    return (
        <div className="home">
            <Banner onSearch={setSearchQuery} />

            {loading && <p className="home__aviso">Carregando livros...</p>}

            {!loading && erro && (
                <div className="home__aviso">
                    <p>{erro}</p>
                    <button
                        type="button"
                        className="home__tentar"
                        onClick={() => setTentativa((n) => n + 1)}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {!loading && !erro && livros.length === 0 && (
                <p className="home__aviso">
                    Nenhum livro encontrado{searchQuery && ` para "${searchQuery}"`}.
                </p>
            )}

            {!loading && livros.length > 0 && (
                <ul className="lista-livros">
                    {livros.map((livro) => {
                        const { title } = livro.volumeInfo;
                        const autores = getAutores(livro.volumeInfo);

                        return (
                            <li key={livro.id}>
                                <article className="card-livro">
                                    <img
                                        className="card-livro__capa"
                                        src={getCapa(livro.volumeInfo)}
                                        alt={`Capa do livro ${title}`}
                                        loading="lazy"
                                    />

                                    <h3 className="card-livro__titulo" title={title}>
                                        {title}
                                    </h3>

                                    {autores && <p className="card-livro__autor">{autores}</p>}

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