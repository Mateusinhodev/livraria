import { useEffect, useRef, useState } from 'react';
import { carregarVisualizador } from '../../lib/googleBooksViewer';

import './previa-google.css';

// Prévia de um livro do Google Books, embutida na página.
// O Google desenha o visualizador dentro da div do ref; o React não mexe nela.
function PreviaGoogle({ livroId, titulo, linkGoogle }) {
    const containerRef = useRef(null);
    const [estado, setEstado] = useState('carregando'); // 'carregando' | 'pronto' | 'indisponivel' | 'erro'

    useEffect(() => {
        const container = containerRef.current;
        let cancelado = false;
        setEstado('carregando');

        // Se o Google não responder em 15 segundos, avisa a pessoa
        const limite = setTimeout(() => {
            setEstado((atual) => (atual === 'carregando' ? 'demorou' : atual));
        }, 15000);

        carregarVisualizador()
            .then(() => {
                if (cancelado || !container) return;

                const visualizador = new window.google.books.DefaultViewer(container);
                visualizador.load(
                    livroId,
                    () => !cancelado && setEstado('indisponivel'), // o Google não encontrou a prévia
                    () => !cancelado && setEstado('pronto')        // a prévia carregou
                );
            })
            .catch(() => {
                if (!cancelado) setEstado('erro');
            });

        return () => {
            cancelado = true;
            clearTimeout(limite);
            if (container) container.innerHTML = ''; // apaga o que o Google desenhou
        };
    }, [livroId]);

    return (
        <div className="previa">
            {estado === 'carregando' && <p className="previa__aviso">Carregando a prévia...</p>}

            {estado === 'indisponivel' && (
                <p className="previa__aviso">A prévia deste livro não está disponível no momento.</p>
            )}

            {estado === 'erro' && (
                <p className="previa__aviso">
                    Não foi possível carregar o visualizador do Google. Verifique sua conexão e tente novamente.
                </p>
            )}

            {estado === 'demorou' && (
                <p className="previa__aviso">
                    A prévia está demorando mais que o normal. Você pode continuar aguardando ou{' '}
                    {linkGoogle ? (
                        <a href={linkGoogle} target="_blank" rel="noopener noreferrer">
                            abrir no Google Livros
                        </a>
                    ) : (
                        'tentar mais tarde'
                    )}
                    .
                </p>
            )}

            {/* Área do Google: o React cria a div, mas nunca coloca nada dentro */}
            <div
                ref={containerRef}
                className="previa__visualizador"
                aria-label={`Prévia de ${titulo}`}
                hidden={estado === 'indisponivel' || estado === 'erro'}
            />
        </div>
    );
}

export default PreviaGoogle;