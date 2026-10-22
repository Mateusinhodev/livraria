import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import Estrelas from '../../components/Estrelas';
import { useEstante } from '../../contexts/EstanteContext';
import { getLinkLivro } from '../../services/estante';
import { listarHistorico, resumoDoAno } from '../../services/estatisticas';

import './estatisticas.css';

const ANO_ATUAL = new Date().getFullYear();

// Um número em destaque com a sua legenda
function Cartao({ valor, legenda, children }) {
    return (
        <div className="cartao-numero">
            <strong className="cartao-numero__valor">{valor}</strong>
            <span className="cartao-numero__legenda">{legenda}</span>
            {children}
        </div>
    );
}

function Estatisticas() {
    const { itens, carregando: carregandoEstante } = useEstante();
    const [params, setParams] = useSearchParams();

    // Ano da URL; se for inválido ou futuro, usa o ano atual
    const anoUrl = Number(params.get('ano'));
    const ano = Number.isInteger(anoUrl) && anoUrl >= 2000 && anoUrl <= ANO_ATUAL ? anoUrl : ANO_ATUAL;

    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    // Busca o diário sempre que o ano muda
    useEffect(() => {
        let cancelado = false;
        setCarregando(true);
        setErro(false);

        listarHistorico(ano)
            .then((linhas) => {
                if (!cancelado) setHistorico(linhas);
            })
            .catch((error) => {
                console.error('Erro ao buscar o histórico', error);
                if (!cancelado) setErro(true);
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        return () => {
            cancelado = true;
        };
    }, [ano]);

    // Os números do ano (só recalcula quando algo muda)
    const resumo = useMemo(() => resumoDoAno(itens, historico, ano), [itens, historico, ano]);

    function mudarAno(novoAno) {
        setParams(novoAno === ANO_ATUAL ? {} : { ano: String(novoAno) }, { replace: true });
    }

    const semDados = resumo.livrosLidos === 0 && resumo.paginasLidas === 0;
    const formatar = (numero) => numero.toLocaleString('pt-BR');

    return (
        <div className="estatisticas">
            <div className="estatisticas__topo">
                <div>
                    <Link className="estatisticas__voltar" to="/estante">
                        ← Minha estante
                    </Link>
                    <h1>Meu ano de leitura</h1>
                </div>

                <div className="estatisticas__ano" role="group" aria-label="Escolher o ano">
                    <button type="button" onClick={() => mudarAno(ano - 1)} aria-label="Ano anterior">
                        ←
                    </button>
                    <strong aria-live="polite">{ano}</strong>
                    <button
                        type="button"
                        onClick={() => mudarAno(ano + 1)}
                        disabled={ano >= ANO_ATUAL}
                        aria-label="Próximo ano"
                    >
                        →
                    </button>
                </div>
            </div>

            {(carregando || carregandoEstante) && <p className="estatisticas__aviso">Calculando suas estatísticas...</p>}

            {!carregando && erro && (
                <p className="estatisticas__aviso">Não foi possível carregar o seu histórico. Tente novamente.</p>
            )}

            {!carregando && !erro && semDados && (
                <div className="estatisticas__vazio">
                    <p>Nenhuma leitura registrada em {ano}.</p>
                    <Link className="estatisticas__explorar" to="/classicos">
                        Começar a ler um clássico
                    </Link>
                </div>
            )}

            {!carregando && !erro && !semDados && (
                <>
                    <div className="estatisticas__cartoes">
                        <Cartao valor={formatar(resumo.livrosLidos)} legenda={resumo.livrosLidos === 1 ? 'livro lido' : 'livros lidos'} />
                        <Cartao valor={formatar(resumo.paginasLidas)} legenda="páginas lidas" />
                        <Cartao valor={formatar(resumo.diasLendo)} legenda={resumo.diasLendo === 1 ? 'dia lendo' : 'dias lendo'} />
                        <Cartao
                            valor={
                                resumo.notaMedia === null
                                    ? '—'
                                    : resumo.notaMedia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
                            }
                            legenda="nota média"
                        >
                            {resumo.notaMedia !== null && (
                                <Estrelas valor={Math.round(resumo.notaMedia)} tamanho="pequeno" />
                            )}
                        </Cartao>
                    </div>

                    <div className="estatisticas__destaques">
                        {resumo.melhorLivro && (
                            <section className="destaque">
                                <h2>Melhor leitura do ano</h2>
                                <Link className="destaque__livro" to={getLinkLivro(resumo.melhorLivro)}>
                                    {resumo.melhorLivro.capa && (
                                        <img className="destaque__capa" src={resumo.melhorLivro.capa} alt="" />
                                    )}
                                    <div>
                                        <strong>{resumo.melhorLivro.titulo}</strong>
                                        {resumo.melhorLivro.autores && <span className="destaque__autor">{resumo.melhorLivro.autores}</span>}
                                        <Estrelas valor={resumo.melhorLivro.nota} tamanho="pequeno" />
                                    </div>
                                </Link>
                            </section>
                        )}

                        {resumo.autoresFavoritos.length > 0 && (
                            <section className="destaque">
                                <h2>Autores mais lidos</h2>
                                <ol className="destaque__autores">
                                    {resumo.autoresFavoritos.map((autor) => (
                                        <li key={autor.nome}>
                                            <span>{autor.nome}</span>
                                            <strong>
                                                {autor.livros} {autor.livros === 1 ? 'livro' : 'livros'}
                                            </strong>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </div>

                    <p className="estatisticas__nota">
                        Páginas e dias de leitura são contados pelo diário de leitura, que começou em outubro de 2026.
                    </p>
                </>
            )}
        </div>
    );
}

export default Estatisticas;