import { useState } from 'react';

// Imagem com plano B: tenta cada fonte, em ordem, até uma carregar.
// Se nenhuma carregar, mostra um quadro "Sem capa".
//
// fontes: lista de URLs em ordem de preferência (valores vazios são ignorados)
// className: classe da imagem; o quadro vazio recebe também a variação "--vazia"
function Capa({ fontes, alt, className }) {
    const urls = fontes.filter(Boolean);
    const [indice, setIndice] = useState(0);

    // Todas as fontes falharam (ou não havia nenhuma)
    if (indice >= urls.length) {
        return <div className={`${className} ${className}--vazia`}>Sem capa</div>;
    }

    return (
        <img
            className={className}
            src={urls[indice]}
            alt={alt}
            onError={() => setIndice((atual) => atual + 1)} // falhou? próxima fonte
        />
    );
}

export default Capa;