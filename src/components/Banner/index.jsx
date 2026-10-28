import { useState } from 'react';
import CampoBusca from '../CampoBusca';

import './banner.css';

const SUGESTOES = ['Machado de Assis', 'Clarice Lispector', 'Ficção científica', 'Romance policial'];

function Banner({ onSearch }) {
    const [search, setSearch] = useState('');

    function buscar(termo) {
        setSearch(termo); // o campo mostra o termo (útil nas sugestões)
        onSearch(termo.trim());
    }

    function handleSubmit(evt) {
        evt.preventDefault();
        buscar(search);
    }

    return (
        <section className="banner">
            <p className="banner__selo">Sua estante digital</p>
            <h1 className="banner__titulo">Encontre seu próximo livro</h1>
            <p className="banner__subtitulo">
                Pesquise livros, acompanhe suas leituras e leia clássicos de graça.
            </p>

            <div className="banner__busca">
                <CampoBusca
                    id="busca-livro"
                    rotulo="Título, autor ou assunto"
                    placeholder="Título, autor ou assunto..."
                    value={search}
                    onChange={setSearch}
                    onSubmit={handleSubmit}
                />
            </div>

            <div className="banner__sugestoes">
                <span>Experimente:</span>
                {SUGESTOES.map((termo) => (
                    <button key={termo} type="button" className="banner__sugestao" onClick={() => buscar(termo)}>
                        {termo}
                    </button>
                ))}
            </div>
        </section>
    );
}

export default Banner;