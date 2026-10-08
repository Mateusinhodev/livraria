import { useState } from 'react';
import './estrelas.css';

const NOTAS = [1, 2, 3, 4, 5];

// Nota de 0 a 5 estrelas.
// Com onChange, vira um seletor (clicar na nota atual zera a avaliação).
// Sem onChange, só exibe.
function Estrelas({ valor, onChange, tamanho = 'medio' }) {
    const [destaque, setDestaque] = useState(null); // estrela sob o mouse
    const nota = valor ?? 0;

    // ── Modo exibição ──
    if (!onChange) {
        return (
            <span
                className={`estrelas estrelas--${tamanho}`}
                role="img"
                aria-label={nota ? `Nota ${nota} de 5` : 'Sem nota'}
            >
                {NOTAS.map((n) => (
                    <span key={n} className={n <= nota ? 'estrela estrela--cheia' : 'estrela'} aria-hidden="true">
                        ★
                    </span>
                ))}
            </span>
        );
    }

    // ── Modo seletor ──
    // Enquanto o mouse está em cima, mostra a prévia; senão, a nota salva
    const exibida = destaque ?? nota;

    return (
        <div
            className={`estrelas estrelas--${tamanho} estrelas--interativa`}
            role="group"
            aria-label="Sua nota"
            onMouseLeave={() => setDestaque(null)}
        >
            {NOTAS.map((n) => (
                <button
                    key={n}
                    type="button"
                    className={n <= exibida ? 'estrela estrela--cheia' : 'estrela'}
                    aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
                    aria-pressed={n === nota}
                    onMouseEnter={() => setDestaque(n)}
                    onFocus={() => setDestaque(n)}
                    onBlur={() => setDestaque(null)}
                    onClick={() => onChange(n === nota ? null : n)}
                >
                    ★
                </button>
            ))}
            <span className="estrelas__texto">{nota ? `${nota}/5` : 'Sem nota'}</span>
        </div>
    );
}

export default Estrelas;