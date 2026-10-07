import './banner.css';
import { useState } from 'react';

function Banner({ onSearch }) {
    const [search, setSearch] = useState('');

    const handleSubmit = (evt) => {
        evt.preventDefault(); // evita o recarregamento da página
        onSearch(search.trim()); // envia o termo para o componente pai (Home)
    };

    return (
        <section className="banner">
            <h2 className="banner__titulo">Encontre seu livro</h2>

            <form className="banner__busca" role="search" onSubmit={handleSubmit}>
                <label htmlFor="busca-livro" className="visualmente-oculto">
                    Nome do livro
                </label>
                <input
                    id="busca-livro"
                    type="search"
                    className="banner__input"
                    placeholder="Digite o nome do livro que procura..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="banner__botao">
                    Pesquisar
                </button>
            </form>

            <img
                className="banner__imagem"
                src="/imagens/livrariavirtual.png"
                alt="Ilustração de uma livraria virtual"
            />
        </section>
    );
}

export default Banner;