import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import BarraProgresso from '../../components/BarraProgresso';
import Estrelas from '../../components/Estrelas';
import { getNomeUsuario, useAuth } from '../../contexts/AuthContext';
import { useEstante } from '../../contexts/EstanteContext';
import { getProgresso, STATUS } from '../../services/estante';

import './estante.css';

// Cada aba sabe filtrar os próprios livros
const ABAS = [
    { id: 'lendo', rotulo: 'Lendo', filtro: (item) => item.status === 'lendo' },
    { id: 'para_ler', rotulo: 'Quero ler', filtro: (item) => item.status === 'para_ler' },
    { id: 'lido', rotulo: 'Lidos', filtro: (item) => item.status === 'lido' },
    { id: 'favoritos', rotulo: 'Favoritos', filtro: (item) => item.favorito },
];

// Mensagem para cada aba vazia
const VAZIO = {
    lendo: 'Nenhum livro em andamento. Abra um livro e marque "Lendo" para acompanhar seu progresso.',
    para_ler: 'Sua lista de leitura está vazia. Marque "Quero ler" nos livros que chamarem sua atenção.',
    lido: 'Você ainda não marcou nenhum livro como lido.',
    favoritos: 'Toque no coração de um livro para guardá-lo aqui.',
};

function Estante() {
    const { usuario } = useAuth();
    const { itens, carregando, salvar } = useEstante();
    const [params, setParams] = useSearchParams();

    // Aba da URL; se não houver (ou for inválida), a primeira
    const abaAtual = ABAS.find((aba) => aba.id === params.get('aba')) ?? ABAS[0];

    // Dado derivado: calculado a cada renderização, nunca guardado
    const livros = itens.filter(abaAtual.filtro);

    async function alternarFavorito(item) {
        try {
            await salvar(item, { favorito: !item.favorito });
        } catch {
            toast.error('Não foi possível atualizar. Tente novamente.');
        }
    }

    return (
        <div className="estante">
            <div className="estante__topo">
                <div>
                    <p className="estante__saudacao">Olá, {getNomeUsuario(usuario)}</p>
                    <h1>Minha estante</h1>
                </div>
                <span className="estante__total">
                    {itens.length === 1 ? '1 livro' : `${itens.length} livros`}
                </span>
            </div>

            {/* As abas */}
            <div className="estante__abas" role="tablist" aria-label="Categorias da estante">
                {ABAS.map((aba) => {
                    const quantidade = itens.filter(aba.filtro).length;
                    const ativa = aba.id === abaAtual.id;

                    return (
                        <button
                            key={aba.id}
                            type="button"
                            role="tab"
                            aria-selected={ativa}
                            className={`estante__aba${ativa ? ' estante__aba--ativa' : ''}`}
                            onClick={() => setParams({ aba: aba.id }, { replace: true })}
                        >
                            {aba.rotulo}
                            <span className="estante__contador">{quantidade}</span>
                        </button>
                    );
                })}
            </div>

            {/* O conteúdo da aba */}
            <div role="tabpanel" aria-label={abaAtual.rotulo}>
                {carregando && itens.length === 0 && <p className="estante__aviso">Carregando sua estante...</p>}

                {!carregando && livros.length === 0 && (
                    <div className="estante__vazia">
                        <p>{VAZIO[abaAtual.id]}</p>
                        <Link className="estante__explorar" to="/">
                            Explorar livros
                        </Link>
                    </div>
                )}

                {livros.length > 0 && (
                    <ul className="estante__lista">
                        {livros.map((item) => {
                            const progresso = getProgresso(item);

                            return (
                                <li key={item.livro_id} className="item-estante">
                                    <Link to={`/livro/${item.livro_id}`} className="item-estante__capa-link" tabIndex={-1}>
                                        {item.capa ? (
                                            <img className="item-estante__capa" src={item.capa} alt="" loading="lazy" />
                                        ) : (
                                            <div className="item-estante__capa item-estante__capa--vazia" />
                                        )}
                                    </Link>

                                    <div className="item-estante__info">
                                        <Link className="item-estante__titulo" to={`/livro/${item.livro_id}`}>
                                            {item.titulo}
                                        </Link>
                                        {item.autores && <span className="item-estante__autor">{item.autores}</span>}

                                        <div className="item-estante__meta">
                                            {item.status && (
                                                <span className={`selo selo--${item.status}`}>{STATUS[item.status]}</span>
                                            )}
                                            {item.nota && <Estrelas valor={item.nota} tamanho="pequeno" />}
                                            {item.resenha && <span className="item-estante__resenha">✎ Resenha</span>}
                                        </div>

                                        {item.status === 'lendo' && (
                                            <div className="item-estante__progresso">
                                                <BarraProgresso valor={progresso ?? 0} />
                                                <span>
                                                    {progresso !== null
                                                        ? `${progresso}% · pág. ${item.pagina_atual} de ${item.total_paginas}`
                                                        : `Página ${item.pagina_atual}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className={`item-estante__favorito${item.favorito ? ' item-estante__favorito--ativo' : ''}`}
                                        onClick={() => alternarFavorito(item)}
                                        aria-pressed={item.favorito}
                                        aria-label={item.favorito ? `Remover ${item.titulo} dos favoritos` : `Favoritar ${item.titulo}`}
                                    >
                                        {item.favorito ? '♥' : '♡'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Estante;