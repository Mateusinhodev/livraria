import { useState } from 'react';
import { Link } from 'react-router-dom';

import { STATUS } from '../../services/estante';

import './card-livro.css';

// Card de livro clicável. Usado na Home e nos Clássicos.
// "selo" é opcional: um rótulo sobre a capa (ex.: "Grátis").
function CardLivro({ to, capa, titulo, autores, status }) {
    const [capaFalhou, setCapaFalhou] = useState(false);
    const mostrarCapa = capa && !capaFalhou;

    return (
        <Link className="card-livro" to={to}>
            <div className="card-livro__capa-area">
                {mostrarCapa ? (
                    <img
                        className="card-livro__capa"
                        src={capa}
                        alt=""
                        loading="lazy"
                        onError={() => setCapaFalhou(true)}
                    />
                ) : (
                    <span className="card-livro__sem-capa" aria-hidden="true">
                        {titulo}
                    </span>
                )}

                {status && <span className={`selo selo--${status} card-livro__selo`}>{STATUS[status]}</span>}
            </div>

            <h3 className="card-livro__titulo" title={titulo}>
                {titulo}
            </h3>
            {autores && <p className="card-livro__autor">{autores}</p>}
        </Link>
    );
}

export default CardLivro;