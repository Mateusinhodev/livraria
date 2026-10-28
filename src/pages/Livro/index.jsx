import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import Capa from '../../components/Capa';
import PainelLeitura from '../../components/PainelLeitura';
import PreviaGoogle from '../../components/PreviaGoogle';
import { buscarCapaAlta } from '../../services/capas';
import { buscarLivro, getMensagemErro } from '../../services/livros';
import { forcarHttps, getAutores, getCapa, limparDescricao, separarParagrafos } from '../../utils/livros';

import './livro-info.css';

const LIMITE_SINOPSE = 600; // acima disso, a sinopse começa recolhida

function Livro() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [livro, setLivro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [capaAlta, setCapaAlta] = useState(null);
    const [mostrarPrevia, setMostrarPrevia] = useState(false);
    const [sinopseAberta, setSinopseAberta] = useState(false);
    const previaRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadLivro() {
            setLoading(true);
            setMostrarPrevia(false);
            setSinopseAberta(false);

            try {
                const dados = await buscarLivro(id, { signal: controller.signal });
                setLivro(dados);
                setLoading(false);
            } catch (error) {
                if (controller.signal.aborted) return;

                // Limite de buscas ou sem internet: mostra o motivo real.
                // Qualquer outro erro: o id não existe (a API não usa só 404 para isso).
                const status = error.response?.status;
                const mensagem =
                    status === 429 || !error.response ? getMensagemErro(error) : 'Livro não encontrado.';

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

    // Ao abrir a prévia, rola até ela (ela fica no fim da página)
    useEffect(() => {
        if (mostrarPrevia) {
            previaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [mostrarPrevia]);

    if (loading) {
        return (
            <div className="livro-info">
                <p className="livro-info__carregando">Carregando detalhes...</p>
            </div>
        );
    }

    const { title, subtitle, description, publisher, publishedDate, pageCount, categories, previewLink, infoLink } =
        livro.volumeInfo;

    const autores = getAutores(livro.volumeInfo);
    const sinopse = separarParagrafos(limparDescricao(description));
    const linkGoogle = forcarHttps(previewLink || infoLink);
    const capaGoogle = getCapa(livro.volumeInfo);
    const capaFundo = capaAlta || capaGoogle;
    const sinopseLonga = sinopse.length > LIMITE_SINOPSE;

    // O Google só permite embutir livros autorizados pelo editor
    const podeEmbutir = livro.accessInfo?.embeddable && livro.accessInfo?.viewability !== 'NO_PAGES';

    return (
        <article
            className="livro-info"
            style={capaFundo ? { '--capa-fundo': `url("${capaFundo}")` } : undefined}
        >
            <div className="livro-info__fundo" aria-hidden="true" />

            <button
                type="button"
                className="botao botao--discreto botao--pequeno livro-info__voltar"
                onClick={() => navigate(-1)}
            >
                ← Voltar
            </button>

            <div className="livro-info__conteudo">
                <div className="livro-info__lateral">
                    <Capa
                        key={`${livro.id}-${capaAlta ?? 'google'}`}
                        className="livro-info__capa"
                        alt={`Capa do livro ${title}`}
                        fontes={[capaAlta, capaGoogle]}
                    />
                </div>

                <div className="livro-info__detalhes">
                    <h1 className="livro-info__titulo">{title}</h1>
                    {subtitle && <p className="livro-info__subtitulo">{subtitle}</p>}
                    {autores && (
                        <p className="livro-info__autor">
                            por <strong>{autores}</strong>
                        </p>
                    )}

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
                                className="botao botao--primario"
                                onClick={() => setMostrarPrevia((aberta) => !aberta)}
                                aria-expanded={mostrarPrevia}
                            >
                                {mostrarPrevia ? 'Fechar prévia' : 'Ler prévia aqui'}
                            </button>
                        )}

                        {linkGoogle && (
                            <a className="botao botao--secundario" href={linkGoogle} target="_blank" rel="noopener noreferrer">
                                Abrir no Google Livros <span aria-hidden="true">↗</span>
                                <span className="visualmente-oculto"> (abre em nova aba)</span>
                            </a>
                        )}
                    </div>

                    <section className="livro-info__sinopse">
                        <h2>Sinopse</h2>
                        {sinopse ? (
                            <>
                                <p
                                    className={`livro-info__texto${
                                        sinopseLonga && !sinopseAberta ? ' livro-info__texto--recolhido' : ''
                                    }`}
                                >
                                    {sinopse}
                                </p>
                                {sinopseLonga && (
                                    <button
                                        type="button"
                                        className="botao botao--discreto botao--pequeno livro-info__ler-mais"
                                        aria-expanded={sinopseAberta}
                                        onClick={() => setSinopseAberta((aberta) => !aberta)}
                                    >
                                        {sinopseAberta ? 'Mostrar menos' : 'Ler mais'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="livro-info__texto">Este livro não possui sinopse disponível.</p>
                        )}
                    </section>

                    <PainelLeitura livro={livro} />
                </div>
            </div>

            {mostrarPrevia && (
                <section ref={previaRef} className="livro-info__previa">
                    <h2>Prévia</h2>
                    <PreviaGoogle livroId={livro.id} titulo={title} linkGoogle={linkGoogle} />
                </section>
            )}
        </article>
    );
}

export default Livro;