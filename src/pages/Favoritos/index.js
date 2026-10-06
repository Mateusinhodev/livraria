import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import useFavoritos from '../../hooks/useFavoritos';
import { adicionarFavorito, removerFavorito } from '../../services/favoritos';

import './favoritos.css';

function getCapa(volumeInfo) {
    const imagens = volumeInfo.imageLinks;
    const url = imagens?.thumbnail || imagens?.smallThumbnail;
    return url?.replace('http://', 'https://');
}

function Favoritos() {
    // A lista se atualiza sozinha quando um livro é removido
    const livros = useFavoritos();

    function excluirLivro(livro) {
        removerFavorito(livro.id);

        toast.info(({ closeToast }) => (
            <div className="toast-desfazer">
                <span>Livro removido</span>
                <button
                    type="button"
                    onClick={() => {
                        adicionarFavorito(livro);
                        closeToast();
                    }}
                >
                    Desfazer
                </button>
            </div>
        ));
    }

    if (livros.length === 0) {
        return (
            <div className="meus-livros meus-livros--vazio">
                <span className="meus-livros__icone" aria-hidden="true">📚</span>
                <h1>Você ainda não salvou nenhum livro</h1>
                <p>Encontre um livro e toque em "Salvar nos favoritos" para vê-lo aqui.</p>
                <Link className="meus-livros__explorar" to="/">
                    Explorar livros
                </Link>
            </div>
        );
    }

    return (
        <div className="meus-livros">
            <div className="meus-livros__topo">
                <h1>Meus livros</h1>
                <span className="meus-livros__total">
                    {livros.length === 1 ? '1 livro' : `${livros.length} livros`}
                </span>
            </div>

            <ul className="meus-livros__lista">
                {livros.map((livro) => {
                    const { title, authors } = livro.volumeInfo;
                    const capa = getCapa(livro.volumeInfo);

                    return (
                        <li key={livro.id} className="item-favorito">
                            {capa ? (
                                <img className="item-favorito__capa" src={capa} alt="" />
                            ) : (
                                <div className="item-favorito__capa item-favorito__capa--vazia" />
                            )}

                            <div className="item-favorito__info">
                                <Link className="item-favorito__titulo" to={`/livro/${livro.id}`}>
                                    {title}
                                </Link>
                                {authors && (
                                    <span className="item-favorito__autor">{authors.join(', ')}</span>
                                )}
                            </div>

                            <div className="item-favorito__acoes">
                                <Link className="item-favorito__detalhes" to={`/livro/${livro.id}`}>
                                    Ver detalhes
                                </Link>
                                <button
                                    type="button"
                                    className="item-favorito__remover"
                                    onClick={() => excluirLivro(livro)}
                                    aria-label={`Remover ${title} dos favoritos`}
                                >
                                    Remover
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Favoritos;