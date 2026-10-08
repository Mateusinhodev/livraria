import './barra-progresso.css';

function BarraProgresso({ valor, rotulo = 'Progresso da leitura' }) {
    // Garante um número entre 0 e 100, mesmo que venha algo estranho
    const porcentagem = Math.max(0, Math.min(100, valor ?? 0));

    return (
        <div
            className="barra-progresso"
            role="progressbar"
            aria-label={rotulo}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={porcentagem}
        >
            <div className="barra-progresso__preenchimento" style={{ width: `${porcentagem}%` }} />
        </div>
    );
}

export default BarraProgresso;