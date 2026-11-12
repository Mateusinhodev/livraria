import './sequencia-leitura.css';

const dias = (n) => (n === 1 ? '1 dia' : `${n} dias`);

function SequenciaLeitura({ atual, recorde, leuHoje }) {
    let mensagem;
    if (atual === 0) mensagem = 'Leia algumas páginas hoje para começar uma sequência.';
    else if (!leuHoje) mensagem = 'Leia hoje para não perder a sua sequência!';
    else if (atual === recorde && atual > 1) mensagem = 'Este é o seu recorde! 🏆';
    else mensagem = 'Você já leu hoje. Volte amanhã!';

    return (
        <section className={`sequencia${leuHoje ? '' : ' sequencia--pendente'}`}>
            <span className="sequencia__chama" aria-hidden="true">
                🔥
            </span>

            <div className="sequencia__texto">
                <strong>
                    {dias(atual)} {atual === 1 ? 'seguido' : 'seguidos'}
                </strong>
                <span>{mensagem}</span>
            </div>

            {recorde > 0 && (
                <div className="sequencia__recorde">
                    <span>Recorde</span>
                    <strong>{dias(recorde)}</strong>
                </div>
            )}
        </section>
    );
}

export default SequenciaLeitura;