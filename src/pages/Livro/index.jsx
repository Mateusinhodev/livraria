import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import PainelLeitura from '../../components/PainelLeitura';
import Capa from '../../components/Capa';
import PreviaGoogle from '../../components/PreviaGoogle';

import { buscarLivro, getMensagemErro } from '../../services/livros';
import { buscarCapaAlta } from '../../services/capas';

import { getCapa, getAutores, limparDescricao, forcarHttps } from '../../utils/livros';

import './livro-info.css';

function Livro() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [livro, setLivro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [capaAlta, setCapaAlta] = useState(null);
    const [mostrarPrevia, setMostrarPrevia] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadLivro() {
            setLoading(true);
            setMostrarPrevia(false);

            try {
                const dados = await buscarLivro(id, { signal: controller.signal });

                setLivro(dados);
                // setSalvo(isFavorito(dados.id));
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

        // Melhoria progressiva: mostra a capa do Google e troca pela da Open Library quando chegar
    useEffect(() => {
        if (!livro) return;

        let cancelado = false;
        setCapaAlta(null);

        buscarCapaAlta(livro.volumeInfo).then((url) => {
            if (!cancelado) setCapaAlta(url);
        });

        return () => {
            cancelado = true;
        };
    }, [livro]);

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

    // const capa = getCapa(livro.volumeInfo);
    const autores = getAutores(livro.volumeInfo);
    const sinopse = limparDescricao(description);
    const linkGoogle = forcarHttps(previewLink || infoLink);

    // O Google só permite embutir livros autorizados pelo editor
    const podeEmbutir = livro.accessInfo?.embeddable && livro.accessInfo?.viewability !== 'NO_PAGES';

    return (
        <article className="livro-info">
            <button type="button" className="livro-info__voltar" onClick={() => navigate(-1)}>
                ← Voltar
            </button>

            <div className="livro-info__conteudo">
                <Capa
                    key={`${livro.id}-${capaAlta ?? 'google'}`}
                    className="livro-info__capa"
                    alt={`Capa do livro ${title}`}
                    fontes={[capaAlta, getCapa(livro.volumeInfo)]}
                />

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
                        {podeEmbutir && (
                            <button
                                type="button"
                                className="livro-info__botao"
                                onClick={() => setMostrarPrevia((aberta) => !aberta)}
                                aria-expanded={mostrarPrevia}
                            >
                                {mostrarPrevia ? 'Fechar prévia' : '📖 Ler prévia aqui'}
                            </button>
                        )}

                        {linkGoogle && (
                            <a
                                className="livro-info__botao livro-info__botao--secundario"
                                href={linkGoogle}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Abrir no Google Livros
                            </a>
                        )}
                    </div>
                    <PainelLeitura livro={livro} />
                </div>
            </div>

            {mostrarPrevia && (
                <section className="livro-info__previa">
                    <h2>Prévia</h2>
                    <PreviaGoogle livroId={livro.id} titulo={title} linkGoogle={linkGoogle}/>
                </section>
            )}

            <section className="livro-info__sinopse">
                <h2>Sinopse</h2>
                <p>{sinopse || 'Este livro não possui sinopse disponível.'}</p>
            </section>
        </article>
    );
}

export default Livro;