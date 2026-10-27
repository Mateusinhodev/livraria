import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getNomeUsuario, useAuth } from '../../contexts/AuthContext';
import { useEstante } from '../../contexts/EstanteContext';

import './header.css';

// "Mateus Dev" → "MD"; "mateus" → "M"
function getIniciais(nome) {
    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
}

// O NavLink chama esta função dizendo se o link está ativo
const classeLink = ({ isActive }) => `header__link${isActive ? ' header__link--ativo' : ''}`;

function Header() {
    const { usuario, sair } = useAuth();
    const { itens } = useEstante();
    const navigate = useNavigate();

    const [menuAberto, setMenuAberto] = useState(false);
    const menuRef = useRef(null);
    const botaoRef = useRef(null);

    const total = itens.length;
    const nome = usuario ? getNomeUsuario(usuario) : '';

    // Com o menu aberto: fecha ao clicar fora ou apertar Esc
    useEffect(() => {
        if (!menuAberto) return;

        function aoClicarFora(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAberto(false);
            }
        }

        function aoApertarTecla(event) {
            if (event.key === 'Escape') {
                setMenuAberto(false);
                botaoRef.current?.focus(); // devolve o foco para o botão
            }
        }

        document.addEventListener('mousedown', aoClicarFora);
        document.addEventListener('keydown', aoApertarTecla);

        return () => {
            document.removeEventListener('mousedown', aoClicarFora);
            document.removeEventListener('keydown', aoApertarTecla);
        };
    }, [menuAberto]);

    function fecharMenu() {
        setMenuAberto(false);
    }

    async function handleSair() {
        fecharMenu();
        await sair();
        toast.info('Você saiu da sua conta');
        navigate('/');
    }

    return (
        <header className="header">
            <div className="header__container">
                <Link className="header__logo" to="/" aria-label="Livraria - página inicial">
                    <span className="header__logo-icone" aria-hidden="true">
                        📚
                    </span>
                    <span className="header__logo-texto">Livraria</span>
                </Link>

                <nav className="header__nav" aria-label="Navegação principal">
                    <NavLink to="/" end className={classeLink}>
                        Explorar
                    </NavLink>
                    <NavLink to="/classicos" className={classeLink}>
                        Clássicos
                    </NavLink>
                    <NavLink
                        to="/estante"
                        className={classeLink}
                        aria-label={total > 0 ? `Minha estante, ${total} ${total === 1 ? 'livro' : 'livros'}` : undefined}
                    >
                        <span className="header__so-computador">Minha estante</span>
                        <span className="header__so-celular">Estante</span>
                        {total > 0 && (
                            <span className="header__contador" aria-hidden="true">
                                {total}
                            </span>
                        )}
                    </NavLink>
                </nav>

                {usuario ? (
                    <div className="header__menu" ref={menuRef}>
                        <button
                            ref={botaoRef}
                            type="button"
                            className="header__avatar"
                            aria-expanded={menuAberto}
                            aria-controls="menu-usuario"
                            aria-label={`Menu da conta de ${nome}`}
                            onClick={() => setMenuAberto((aberto) => !aberto)}
                        >
                            {getIniciais(nome)}
                        </button>

                        {menuAberto && (
                            <div id="menu-usuario" className="header__dropdown">
                                <div className="header__dropdown-topo">
                                    <strong>{nome}</strong>
                                    <span>{usuario.email}</span>
                                </div>

                                <Link to="/estante" onClick={fecharMenu}>
                                    Minha estante
                                </Link>
                                <Link to="/estatisticas" onClick={fecharMenu}>
                                    Meu ano de leitura
                                </Link>

                                <button type="button" className="header__sair" onClick={handleSair}>
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link className="botao botao--primario" to="/entrar"></Link>
                )}
            </div>
        </header>
    );
}

export default Header;