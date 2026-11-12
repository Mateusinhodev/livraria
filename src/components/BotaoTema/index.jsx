import { useTema } from '../../hooks/useTema';

import './botao-tema.css';

// A cada clique, passa para a próxima opção
const PROXIMO = { sistema: 'claro', claro: 'escuro', escuro: 'sistema' };
const NOMES = { sistema: 'igual ao sistema', claro: 'claro', escuro: 'escuro' };

// Ícones em SVG (traço), um para cada preferência
const ICONES = {
    sistema: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    ),
    claro: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
    ),
    escuro: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
    ),
};

function BotaoTema() {
    const [preferencia, setPreferencia] = useTema();
    const proximo = PROXIMO[preferencia];
    const descricao = `Tema ${NOMES[preferencia]}. Mudar para ${NOMES[proximo]}`;

    return (
        <button
            type="button"
            className="botao botao--discreto botao-tema"
            onClick={() => setPreferencia(proximo)}
            aria-label={descricao}
            title={descricao}
        >
            {ICONES[preferencia]}
        </button>
    );
}

export default BotaoTema;