import { useEffect, useState } from 'react';                               // NOVO
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import BarraProgresso from '../BarraProgresso';                            // NOVO
import Estrelas from '../Estrelas';                                        // NOVO
import { useAuth } from '../../contexts/AuthContext';
import { useEstante } from '../../contexts/EstanteContext';
import { getProgresso, livroParaItem, STATUS } from '../../services/estante';

import './painel-leitura.css';

const LIMITE_RESENHA = 10000; // NOVO: o mesmo limite da tabela (aula 1)

// Painel da página do livro: estante, favorito, progresso, nota e resenha
function PainelLeitura({ livro }) {
    const { usuario } = useAuth();
    const { getItem, salvar } = useEstante();
    const location = useLocation();

    const base = livroParaItem(livro);
    const item = getItem(livro.id);

    // NOVO: os "rascunhos" dos campos de texto
    const [pagina, setPagina] = useState('');
    const [totalPaginas, setTotalPaginas] = useState('');
    const [resenha, setResenha] = useState('');

    // NOVO: quando o progresso salvo muda, atualiza o rascunho
    useEffect(() => {
        setPagina(String(item?.pagina_atual ?? 0));
        setTotalPaginas(String(item?.total_paginas ?? base.total_paginas ?? ''));
    }, [item?.pagina_atual, item?.total_paginas, base.total_paginas]);

    // NOVO: quando a resenha salva muda, atualiza o rascunho
    useEffect(() => {
        setResenha(item?.resenha ?? '');
    }, [item?.resenha]);

    if (!usuario) {
        return (
            <div className="painel-leitura painel-leitura--convite">
                <p>Entre na sua conta para adicionar este livro à estante, acompanhar a leitura e escrever uma resenha.</p>
                <Link className="painel-leitura__entrar" to="/entrar" state={{ de: location.pathname }}>
                    Entrar ou criar conta
                </Link>
            </div>
        );
    }

    async function atualizar(mudancas, mensagem) {
        try {
            const resultado = await salvar(base, mudancas);
            if (mensagem) toast.success(mensagem);
            return resultado; // NOVO: devolve o resultado para quem chamou
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível salvar. Tente novamente.');
            return undefined;
        }
    }

    function escolherStatus(status) {
        if (item?.status === status) return;
        atualizar({ status }, status === 'lido' ? 'Leitura concluída! 🎉' : `Movido para "${STATUS[status]}"`);
    }

    // NOVO: salvar a página atual e o total
    async function salvarProgresso(evt) {
        evt.preventDefault();

        const total = Number(totalPaginas) > 0 ? Math.round(Number(totalPaginas)) : null;
        const atual = Number(pagina);

        if (Number.isNaN(atual) || atual < 0) {
            toast.warn('Digite um número de página válido.');
            return;
        }

        const resultado = await atualizar({ pagina_atual: atual, total_paginas: total });

        // A regra 3 da aula 5 pode ter marcado o livro como lido
        if (resultado?.status === 'lido' && item?.status === 'lendo') {
            toast.success('Você chegou à última página. Leitura concluída! 🎉');
        } else if (resultado) {
            toast.success('Progresso salvo');
        }
    }

    // NOVO: tirar da estante pode apagar nota e resenha; confirma antes
    function tirarDaEstante() {
        const perdeDados = !item.favorito && (item.nota || item.resenha);
        if (perdeDados && !window.confirm('Sua nota e sua resenha deste livro serão apagadas. Continuar?')) {
            return;
        }
        atualizar({ status: null }, 'Removido da estante');
    }

    const progresso = getProgresso(item);                                          // NOVO
    const resenhaAlterada = resenha.trim() !== (item?.resenha ?? '').trim();       // NOVO

    return (
        <div className="painel-leitura">
            <div className="painel-leitura__linha">
                <div className="painel-leitura__status" role="group" aria-label="Estante">
                    {Object.entries(STATUS).map(([valor, rotulo]) => (
                        <button
                            key={valor}
                            type="button"
                            aria-pressed={item?.status === valor}
                            className={item?.status === valor ? 'ativo' : ''}
                            onClick={() => escolherStatus(valor)}
                        >
                            {rotulo}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className={`painel-leitura__favorito${item?.favorito ? ' ativo' : ''}`}
                    aria-pressed={Boolean(item?.favorito)}
                    onClick={() =>
                        atualizar(
                            { favorito: !item?.favorito },
                            item?.favorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos'
                        )
                    }
                >
                    {item?.favorito ? '♥ Favorito' : '♡ Favoritar'}
                </button>
            </div>

            {item?.status && (
                <button type="button" className="painel-leitura__remover" onClick={tirarDaEstante}>
                    Tirar da estante
                </button>
            )}

            {/* NOVO: progresso (só para quem está lendo) */}
            {item?.status === 'lendo' && (
                <form className="painel-leitura__secao" onSubmit={salvarProgresso}>
                    <h3>Progresso</h3>
                    {progresso !== null && (
                        <div className="painel-leitura__progresso">
                            <BarraProgresso valor={progresso} />
                            <strong>{progresso}%</strong>
                        </div>
                    )}
                    <div className="painel-leitura__paginas">
                        <label>
                            <span>Página atual</span>
                            <input
                                type="number"
                                min="0"
                                max={totalPaginas || undefined}
                                value={pagina}
                                onChange={(e) => setPagina(e.target.value)}
                            />
                        </label>
                        <span className="painel-leitura__de">de</span>
                        <label>
                            <span>Total de páginas</span>
                            <input
                                type="number"
                                min="1"
                                value={totalPaginas}
                                onChange={(e) => setTotalPaginas(e.target.value)}
                                placeholder="?"
                            />
                        </label>
                        <button type="submit" className="painel-leitura__salvar">
                            Salvar
                        </button>
                    </div>
                </form>
            )}

            {/* NOVO: data de conclusão */}
            {item?.status === 'lido' && item.concluido_em && (
                <p className="painel-leitura__concluido">
                    Lido em {new Date(`${item.concluido_em}T12:00:00`).toLocaleDateString('pt-BR')}
                </p>
            )}

            {/* NOVO: nota */}
            {item && (
                <div className="painel-leitura__secao">
                    <h3>Sua nota</h3>
                    <Estrelas
                        valor={item.nota}
                        onChange={(nota) => atualizar({ nota }, nota ? null : 'Nota removida')}
                    />
                </div>
            )}

            {/* NOVO: resumo ou resenha */}
            {item && (
                <form
                    className="painel-leitura__secao"
                    onSubmit={(evt) => {
                        evt.preventDefault();
                        atualizar({ resenha }, 'Resenha salva');
                    }}
                >
                    <label className="campo">
                        <span>Resumo ou resenha</span>
                        <textarea
                            rows={6}
                            value={resenha}
                            maxLength={LIMITE_RESENHA}
                            onChange={(e) => setResenha(e.target.value)}
                            placeholder="O que você achou? Anote ideias principais, trechos marcantes ou sua opinião."
                        />
                    </label>
                    <div className="painel-leitura__rodape">
                        <small>
                            {resenha.length.toLocaleString('pt-BR')}/{LIMITE_RESENHA.toLocaleString('pt-BR')} · visível só
                            para você
                        </small>
                        <button type="submit" className="painel-leitura__salvar" disabled={!resenhaAlterada}>
                            Salvar resenha
                        </button>
                    </div>
                </form>
            )}

            {!item && (
                <p className="painel-leitura__dica">Escolha uma opção acima para colocar o livro na sua estante.</p>
            )}
        </div>
    );
}

export default PainelLeitura;