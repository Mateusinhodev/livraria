import { useEffect, useState } from 'react';

import Banner from '../../components/Banner';
import CardLivro from '../../components/CardLivro';

import { useEstante } from '../../contexts/EstanteContext';

import { buscarLivros, getMensagemErro } from '../../services/livros';
import { getAutores, getCapa } from '../../utils/livros';

import './home.css';

function Home() {
    const { getItem } = useEstante();

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

    const vazio = !loading && !erro && livros.length === 0;

    return (
        <div className="home">
            <Banner onSearch={setSearchQuery} />

            <section className="home__resultados">
                <div className="home__cabecalho">
                    <h2>{searchQuery ? `Resultados para “${searchQuery}”` : 'Em destaque'}</h2>
                    {!loading && livros.length > 0 && (
                        <span>{livros.length === 1 ? '1 livro' : `${livros.length} livros`}</span>
                    )}
                </div>

                {loading && <p className="home__aviso">Carregando livros...</p>}

                {!loading && erro && (
                    <div className="home__aviso">
                        <p>{erro}</p>
                        <button
                            type="button"
                            className="botao botao--secundario"
                            onClick={() => setTentativa((n) => n + 1)}
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {vazio && (
                    <div className="home__vazio">
                        <img src="/imagens/livrariavirtual.png" alt="" />
                        <p>
                            <strong>Nenhum livro encontrado{searchQuery && ` para “${searchQuery}”`}.</strong>
                        </p>
                        <p>Tente outro título, o nome do autor ou um assunto.</p>
                    </div>
                )}

                {!loading && livros.length > 0 && (
                    <ul className="grade-livros">
                        {livros.map((livro) => (
                            <li key={livro.id}>
                                <CardLivro
                                    to={`/livro/${livro.id}`}
                                    capa={getCapa(livro.volumeInfo)}
                                    titulo={livro.volumeInfo.title}
                                    autores={getAutores(livro.volumeInfo)}
                                    status={getItem(livro.id)?.status}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default Home;