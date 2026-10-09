import './header.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEstante } from '../../contexts/EstanteContext';
import { getNomeUsuario, useAuth } from '../../contexts/AuthContext';

function Header() {
    const { usuario, sair } = useAuth();
    const { itens } = useEstante();
    const navigate = useNavigate();

    const total = itens.length;
    const descricao = total === 1 ? '1 livro' : `${total} livros`;

    async function handleSair() {
        await sair();
        toast.info('Você saiu da sua conta');
        navigate('/');
    }

    return (
        <header className="header">
            <div className="header__container">
                <Link className="header__logo" to="/" aria-label="Livraria - página inicial">
                    <span className="header__logo-icon" aria-hidden="true">📚</span>
                    <span className="header__logo-texto">Livraria</span>
                </Link>

                <nav className="header__nav" aria-label="Navegação principal">
                    <NavLink
                        to="/classicos"
                        className={({ isActive }) => `header__link${isActive ? ' header__link--ativo' : ''}`}
                    >
                        Clássicos
                    </NavLink>
                    <NavLink
                        to="/estante"
                        aria-label={usuario ? `Minha estante, ${descricao}` : 'Minha estante'}
                        className={({ isActive }) =>
                            `header__favoritos${isActive ? ' header__favoritos--ativo' : ''}`
                        }
                    >
                        Minha estante
                        {total > 0 && (
                            <span className="header__contador" aria-hidden="true">
                                {total}
                            </span>
                        )}
                    </NavLink>

                    {usuario ? (
                        <div className="header__usuario">
                            <span className="header__nome" title={usuario.email}>
                                {getNomeUsuario(usuario)}
                            </span>
                            <button type="button" className="header__sair" onClick={handleSair}>
                                Sair
                            </button>
                        </div>
                    ) : (
                        <Link className="header__entrar" to="/entrar">
                            Entrar
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;