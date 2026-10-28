import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getMensagemErroClassicos, listarClassicos, POR_PAGINA } from '../../services/classicos';

import CampoBusca from '../../components/CampoBusca';
import CardLivro from '../../components/CardLivro';
import { useEstante } from '../../contexts/EstanteContext';

import './classicos.css';

function Classicos() {
    const { getItem } = useEstante();

    const [params, setParams] = useSearchParams();
    const busca = params.get('busca') ?? '';
    const pagina = Math.max(1, Number(params.get('pagina')) || 1);

    const [termo, setTermo] = useState(busca); // rascunho do campo de busca
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [tentativa, setTentativa] = useState(0);

    // Se a busca mudar pela URL (ex.: botão Voltar), atualiza o campo
    useEffect(() => {
        setTermo(busca);
    }, [busca]);

    // Busca no catálogo sempre que a busca, a página ou a tentativa mudam
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setErro('');

        listarClassicos({ busca, pagina, signal: controller.signal })
            .then((dados) => {
                setResultado(dados);
                setLoading(false);
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                console.error('Erro ao buscar clássicos', error);
                setErro(getMensagemErroClassicos(error));
                setLoading(false);
            });

        return () => controller.abort();
    }, [busca, pagina, tentativa]);

    function pesquisar(evt) {
        evt.preventDefault();
        const texto = termo.trim();
        setParams(texto ? { busca: texto } : {}); // nova busca sempre começa na página 1
    }

    function irParaPagina(numero) {
        const novos = { pagina: String(numero) };
        if (busca) novos.busca = busca;
        setParams(novos); // sem replace: o "Voltar" do navegador volta à página anterior
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / POR_PAGINA)) : 1;

    return (
        <div className="classicos">
            <section className="classicos__topo">
                <h1>Clássicos grátis</h1>
                <p className="classicos__subtitulo">
                    Livros em domínio público, em português, para ler completos aqui no site. Acervo do{' '}
                    <a href="https://www.gutenberg.org" target="_blank" rel="noreferrer">
                        Project Gutenberg
                    </a>
                    .
                </p>

                <div className="classicos__busca">
                    <CampoBusca
                        id="busca-classicos"
                        rotulo="Título ou autor"
                        placeholder="Título ou autor (ex.: Machado de Assis)"
                        value={termo}
                        onChange={setTermo}
                        onSubmit={pesquisar}
                        textoBotao="Buscar"
                    />
                </div>
            </section>

            {loading && (
                <p className="classicos__aviso">Carregando clássicos... O catálogo pode levar alguns segundos.</p>
            )}

            {!loading && erro && (
                <div className="classicos__aviso">
                    <p>{erro}</p>
                    <button type="button" className="botao botao--secundario" onClick={() => setTentativa((n) => n + 1)}>
                        Tentar novamente
                    </button>
                </div>
            )}

            {!loading && !erro && resultado?.livros.length === 0 && (
                <p className="classicos__aviso">Nenhum clássico encontrado para "{busca}".</p>
            )}

            {!loading && !erro && resultado?.livros.length > 0 && (
                <>
                    <p className="classicos__total">
                        {resultado.total.toLocaleString('pt-BR')} {resultado.total === 1 ? 'livro' : 'livros'}
                        {busca && ` para "${busca}"`}
                    </p>

                    <ul className="grade-livros">
                        {resultado.livros.map((livro) => (
                            <li key={livro.id}>
                                <CardLivro
                                    to={`/ler/${livro.id}`}
                                    capa={livro.capa}
                                    titulo={livro.titulo}
                                    autores={livro.autores}
                                    status={getItem(`gutenberg-${livro.id}`)?.status}
                                />
                            </li>
                        ))}
                    </ul>

                    {totalPaginas > 1 && (
                        <nav className="classicos__paginacao" aria-label="Páginas do catálogo">
                            <button className="botao botao--secundario" type="button" disabled={pagina <= 1} onClick={() => irParaPagina(pagina - 1)}>
                                ← Anterior
                            </button>
                            <span>
                                Página {pagina} de {totalPaginas}
                            </span>
                            <button
                                className="botao botao--secundario"
                                type="button"
                                disabled={pagina >= totalPaginas}
                                onClick={() => irParaPagina(pagina + 1)}
                            >
                                Próxima →
                            </button>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}

export default Classicos;