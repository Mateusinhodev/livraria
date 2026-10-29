import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';


import Estrelas from '../../components/Estrelas';
import GraficoMeses from '../../components/GraficoMeses';
import MetaAnual from '../../components/MetaAnual';
import SequenciaLeitura from '../../components/SequenciaLeitura';

import { useEstante } from '../../contexts/EstanteContext';
import { useAuth } from '../../contexts/AuthContext';

import { getLinkLivro } from '../../services/estante';
import {
    buscarMeta,
    listarDiasDeLeitura,
    listarHistorico,
    removerMeta,
    resumoDoAno,
    salvarMeta,
    sequenciaDeLeitura,
} from '../../services/estatisticas';

import './estatisticas.css';

const ANO_ATUAL = new Date().getFullYear();

// Um número em destaque com a sua legenda
function Cartao({ valor, legenda, children }) {
    return (
        <div className="cartao cartao-numero">
            <strong className="cartao-numero__valor">{valor}</strong>
            <span className="cartao-numero__legenda">{legenda}</span>
            {children}
        </div>
    );
}

function Estatisticas() {
    const { itens, carregando: carregandoEstante } = useEstante();
    const { usuario } = useAuth();
    const [params, setParams] = useSearchParams();

    // Ano da URL; se for inválido ou futuro, usa o ano atual
    const anoUrl = Number(params.get('ano'));
    const ano = Number.isInteger(anoUrl) && anoUrl >= 2000 && anoUrl <= ANO_ATUAL ? anoUrl : ANO_ATUAL;

    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const [meta, setMeta] = useState(null);
    const [dias, setDias] = useState(null);

    // Busca o diário sempre que o ano muda
    useEffect(() => {
        let cancelado = false;
        setCarregando(true);
        setErro(false);

        Promise.all([listarHistorico(ano), buscarMeta(ano)])
            .then(([linhas, metaDoAno]) => {
                if (cancelado) return;
                setHistorico(linhas);
                setMeta(metaDoAno);
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

        // A sequência não depende do ano: busca uma vez quando a página abre
    useEffect(() => {
        let cancelado = false;

        listarDiasDeLeitura()
            .then((lista) => {
                if (!cancelado) setDias(lista);
            })
            .catch((error) => {
                // Não é essencial: se falhar, a página funciona sem a sequência
                console.error('Erro ao buscar os dias de leitura', error);
            });

        return () => {
            cancelado = true;
        };
    }, []);

    const sequencia = useMemo(() => (dias ? sequenciaDeLeitura(dias) : null), [dias]);

    // Os números do ano (só recalcula quando algo muda)
    const resumo = useMemo(() => resumoDoAno(itens, historico, ano), [itens, historico, ano]);

    async function handleSalvarMeta(livros) {
        try {
            await salvarMeta(usuario.id, ano, livros);
            setMeta(livros);
            toast.success('Meta salva!');
        } catch (error) {
            console.error('Erro ao salvar a meta', error);
            toast.error('Não foi possível salvar a meta');
            throw error; // avisa o componente para manter o formulário aberto
        }
    }

    async function handleRemoverMeta() {
        try {
            await removerMeta(ano);
            setMeta(null);
            toast.info('Meta removida');
        } catch (error) {
            console.error('Erro ao remover a meta', error);
            toast.error('Não foi possível remover a meta');
            throw error;
        }
    }

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
                    <button 
                        type="button" 
                        className="botao botao--secundario estatisticas__seta"
                        onClick={() => mudarAno(ano - 1)} 
                        aria-label="Ano anterior"
                    >
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

            {!carregando && !carregandoEstante && !erro && (
                <MetaAnual
                    key={ano}
                    ano={ano}
                    meta={meta}
                    lidos={resumo.livrosLidos}
                    onSalvar={handleSalvarMeta}
                    onRemover={handleRemoverMeta}
                />
            )}

            {ano === ANO_ATUAL && sequencia && <SequenciaLeitura {...sequencia} />}

            {!carregando && !erro && semDados && (
                <div className="estatisticas__vazio">
                    <p>Nenhuma leitura registrada em {ano}.</p>
                    <Link className="botao botao--primario estatisticas__explorar" to="/classicos"></Link>
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

                    <GraficoMeses porMes={resumo.porMes} ano={ano} />

                    <div className="estatisticas__destaques">
                        {resumo.melhorLivro && (
                            <section className="cartao destaque">
                                <h2 className='rotulo'>Melhor leitura do ano</h2>
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
                            <section className="cartao destaque">
                                <h2 className='rotulo'>Autores mais lidos</h2>
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