import './header.css';
import { Link, NavLink } from 'react-router-dom';
import useFavoritos from '../../hooks/useFavoritos';

function Header() {
    const favoritos = useFavoritos();
    const total = favoritos.length;

    const descricao = total === 1 ? '1 livro salvo' : `${total} livros salvos`;

    return (
        <header className="header">
            <div className="header__container">
                <Link className="header__logo" to="/" aria-label="Livraria - página inicial">
                    <span className="header__logo-icon" aria-hidden="true">📚</span>
                    Livraria
                </Link>

                <nav aria-label="Navegação principal">
                    <NavLink
                        to="/favoritos"
                        aria-label={`Meus livros, ${descricao}`}
                        className={({ isActive }) =>
                            `header__favoritos${isActive ? ' header__favoritos--ativo' : ''}`
                        }
                    >
                        Meus livros
                        {total > 0 && (
                            <span className="header__contador" aria-hidden="true">
                                {total}
                            </span>
                        )}
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}

export default Header;