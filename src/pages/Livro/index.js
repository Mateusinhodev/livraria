import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { buscarLivro, getMensagemErro } from '../../services/livros';
import { isFavorito, adicionarFavorito, removerFavorito } from '../../services/favoritos';
import { getCapa, getAutores, limparDescricao, forcarHttps } from '../../utils/livros';

import './livro-info.css';

function Livro() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [livro, setLivro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salvo, setSalvo] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadLivro() {
            setLoading(true);

            try {
                const dados = await buscarLivro(id, { signal: controller.signal });

                setLivro(dados);
                setSalvo(isFavorito(dados.id));
                setLoading(false);
            } catch (error) {
                if (controller.signal.aborted) return;

                // Limite de buscas ou sem internet: mostra o motivo real.
                // Qualquer outro erro: o id não existe (a API não usa só 404 para isso).
                const status = error.response?.status;
                const mensagem =
                    status === 429 || !error.response
                        ? getMensagemErro(error)
                        : 'Livro não encontrado.';

                toast.error(mensagem);
                navigate('/', { replace: true });
            }
        }

        loadLivro();

        return () => controller.abort();
    }, [id, navigate]);

    function alternarFavorito() {
        if (salvo) {
            removerFavorito(livro.id);
            setSalvo(false);
            toast.info('Livro removido dos favoritos');
        } else {
            adicionarFavorito(livro);
            setSalvo(true);
            toast.success('Livro salvo nos favoritos');
        }
    }

    if (loading) {
        return (
            <div className="livro-info">
                <p className="livro-info__carregando">Carregando detalhes...</p>
            </div>
        );
    }

    const {
        title,
        subtitle,
        description,
        publisher,
        publishedDate,
        pageCount,
        categories,
        previewLink,
        infoLink,
    } = livro.volumeInfo;

    const capa = getCapa(livro.volumeInfo, { grande: true });
    const autores = getAutores(livro.volumeInfo);
    const sinopse = limparDescricao(description);
    const linkGoogle = forcarHttps(previewLink || infoLink);

    return (
        <article className="livro-info">
            <button type="button" className="livro-info__voltar" onClick={() => navigate(-1)}>
                ← Voltar
            </button>

            <div className="livro-info__conteudo">
                {capa ? (
                    <img className="livro-info__capa" src={capa} alt={`Capa do livro ${title}`} />
                ) : (
                    <div className="livro-info__capa livro-info__capa--vazia">Sem capa</div>
                )}

                <div className="livro-info__detalhes">
                    <h1 className="livro-info__titulo">{title}</h1>
                    {subtitle && <p className="livro-info__subtitulo">{subtitle}</p>}
                    {autores && <p className="livro-info__autor">por {autores}</p>}

                    <dl className="livro-info__meta">
                        {publisher && (
                            <div>
                                <dt>Editora</dt>
                                <dd>{publisher}</dd>
                            </div>
                        )}
                        {publishedDate && (
                            <div>
                                <dt>Ano</dt>
                                <dd>{publishedDate.slice(0, 4)}</dd>
                            </div>
                        )}
                        {pageCount > 0 && (
                            <div>
                                <dt>Páginas</dt>
                                <dd>{pageCount}</dd>
                            </div>
                        )}
                        {categories && (
                            <div>
                                <dt>Categoria</dt>
                                <dd>{categories.join(', ')}</dd>
                            </div>
                        )}
                    </dl>

                    <div className="livro-info__acoes">
                        <button
                            type="button"
                            className={`livro-info__botao${salvo ? ' livro-info__botao--secundario' : ''}`}
                            onClick={alternarFavorito}
                            aria-pressed={salvo}
                        >
                            {salvo ? '★ Remover dos favoritos' : '☆ Salvar nos favoritos'}
                        </button>

                        {linkGoogle && (
                            <a
                                className="livro-info__botao livro-info__botao--secundario"
                                href={linkGoogle}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Ver no Google Livros
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <section className="livro-info__sinopse">
                <h2>Sinopse</h2>
                <p>{sinopse || 'Este livro não possui sinopse disponível.'}</p>
            </section>
        </article>
    );
}

export default Livro;