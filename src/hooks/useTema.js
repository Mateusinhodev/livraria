import { useEffect, useState } from 'react';

const CHAVE = 'livraria:tema';
const PREFERENCIAS = ['sistema', 'claro', 'escuro'];
const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');

function lerPreferencia() {
    try {
        const salva = localStorage.getItem(CHAVE);
        return PREFERENCIAS.includes(salva) ? salva : 'sistema';
    } catch {
        return 'sistema'; // navegador bloqueou o localStorage
    }
}

// Transforma a preferência no tema aplicado (mesma lógica do script do index.html)
function aplicarTema(preferencia) {
    const escuro = preferencia === 'escuro' || (preferencia === 'sistema' && sistemaEscuro.matches);
    document.documentElement.dataset.tema = escuro ? 'escuro' : 'claro';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', escuro ? '#1C1917' : '#FFFFFF');
}

export function useTema() {
    const [preferencia, setPreferencia] = useState(lerPreferencia);

    // Aplica e guarda sempre que a preferência muda
    useEffect(() => {
        aplicarTema(preferencia);
        try {
            localStorage.setItem(CHAVE, preferencia);
        } catch {
            // sem localStorage: a escolha vale só nesta visita
        }
    }, [preferencia]);

    // No modo "sistema", acompanha quando o sistema troca de tema (ex.: anoitecer no celular)
    useEffect(() => {
        if (preferencia !== 'sistema') return;

        const aoMudar = () => aplicarTema('sistema');
        sistemaEscuro.addEventListener('change', aoMudar);
        return () => sistemaEscuro.removeEventListener('change', aoMudar);
    }, [preferencia]);

    return [preferencia, setPreferencia];
}