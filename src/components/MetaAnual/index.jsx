import { useState } from 'react';

import { ritmoDaMeta } from '../../services/estatisticas';

import './meta-anual.css';

const plural = (n, um, varios) => (n === 1 ? um : varios);

function textoSituacao(r) {
    switch (r.situacao) {
        case 'concluida':
            return `🎉 Meta batida! Você leu ${r.lidos} de ${r.meta} livros.`;
        case 'encerrada':
            return `O ano terminou com ${r.lidos} de ${r.meta} livros.`;
        case 'adiantado':
            return `Você está ${r.diferenca} ${plural(r.diferenca, 'livro', 'livros')} à frente do ritmo.`;
        case 'no-ritmo':
            return 'Você está exatamente no ritmo da meta.';
        default: {
            const atras = -r.diferenca;
            return `Você está ${atras} ${plural(atras, 'livro', 'livros')} atrás do ritmo.`;
        }
    }
}

function textoDica(r) {
    if (r.faltam === 0 || r.diasRestantes === 0) return null;

    const intervalo = Math.floor(r.diasRestantes / r.faltam);
    const frequencia =
        intervalo >= 1
            ? `cerca de 1 livro a cada ${intervalo} ${plural(intervalo, 'dia', 'dias')}`
            : 'mais de 1 livro por dia';

    return `${plural(r.faltam, 'Falta', 'Faltam')} ${r.faltam} ${plural(r.faltam, 'livro', 'livros')} em ${
        r.diasRestantes
    } ${plural(r.diasRestantes, 'dia', 'dias')}: ${frequencia}.`;
}

function MetaAnual({ ano, meta, lidos, onSalvar, onRemover }) {
    const [editando, setEditando] = useState(false);
    const [rascunho, setRascunho] = useState('');
    const [salvando, setSalvando] = useState(false);

    const anoAtual = new Date().getFullYear();
    const valor = Number(rascunho);
    const valido = Number.isInteger(valor) && valor >= 1 && valor <= 1000;

    function abrirEdicao() {
        setRascunho(String(meta ?? 12)); // sugestão: 1 livro por mês
        setEditando(true);
    }

    // Roda salvar/remover controlando o "Salvando..." e fecha o formulário se der certo
    async function executar(acao) {
        setSalvando(true);
        try {
            await acao();
            setEditando(false);
        } catch {
            // A página já mostrou o toast de erro; o formulário continua aberto
        } finally {
            setSalvando(false);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (valido) executar(() => onSalvar(valor));
    }

    // Modo 1: formulário
    if (editando) {
        return (
            <section className="cartao meta-anual">
                <h2>Meta de {ano}</h2>

                <form className="meta-anual__form" onSubmit={handleSubmit}>
                    <label>
                        Quantos livros você quer ler?
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            step="1"
                            value={rascunho}
                            onChange={(e) => setRascunho(e.target.value)}
                            autoFocus
                        />
                    </label>

                    <div className="meta-anual__botoes">
                        <button type="submit" className="botao botao--primario" disabled={!valido || salvando}>
                            {salvando ? 'Salvando...' : 'Salvar meta'}
                        </button>
                        <button
                            type="button"
                            className="meta-anual__link"
                            onClick={() => setEditando(false)}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>
                        {meta !== null && (
                            <button
                                type="button"
                                className="meta-anual__link meta-anual__link--perigo"
                                onClick={() => executar(onRemover)}
                                disabled={salvando}
                            >
                                Remover meta
                            </button>
                        )}
                    </div>
                </form>
            </section>
        );
    }

    // Modo 2: sem meta (só convidamos no ano atual; não dá para mudar o passado)
    if (meta === null) {
        if (ano < anoAtual) return null;

        return (
            <section className="cartao meta-anual meta-anual--convite">
                <p>Que tal definir uma meta de leitura para {ano}?</p>
                <button type="button" className="botao botao--primario" onClick={abrirEdicao}>
                    Definir meta
                </button>
            </section>
        );
    }

    // Modo 3: progresso
    const ritmo = ritmoDaMeta(meta, lidos, ano);
    const dica = textoDica(ritmo);
    const mostrarMarcador = ritmo.fracaoAno < 1 && ritmo.situacao !== 'concluida';

    return (
        <section className={`cartao meta-anual meta-anual--${ritmo.situacao}`}>
            <div className="meta-anual__topo">
                <h2 className="rotulo">Meta de {ano}</h2>
                <button type="button" className="meta-anual__link" onClick={abrirEdicao}>
                    Alterar
                </button>
            </div>

            <p className="meta-anual__numeros">
                <strong>{lidos}</strong> de {meta} {plural(meta, 'livro', 'livros')}
            </p>

            <div
                className="meta-anual__barra"
                role="progressbar"
                aria-label={`Meta de ${ano}`}
                aria-valuemin={0}
                aria-valuemax={meta}
                aria-valuenow={Math.min(lidos, meta)}
                aria-valuetext={`${lidos} de ${meta} livros`}
            >
                <div className="meta-anual__preenchido" style={{ width: `${ritmo.percentual * 100}%` }} />
                {mostrarMarcador && (
                    <span
                        className="meta-anual__hoje"
                        style={{ left: `${ritmo.fracaoAno * 100}%` }}
                        title="Onde você deveria estar hoje"
                    />
                )}
            </div>

            <p className="meta-anual__situacao">{textoSituacao(ritmo)}</p>
            {dica && <p className="meta-anual__dica">{dica}</p>}
        </section>
    );
}

export default MetaAnual;