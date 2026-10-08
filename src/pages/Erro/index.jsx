import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './erro.css';

function Erro() {
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Página não encontrada | Livraria';
        return () => {
            document.title = 'Livraria';
        };
    }, []);

    return (
        <section className="erro">
            <span className="erro__icone" aria-hidden="true">📖</span>

            <p className="erro__codigo">404</p>
            <h1 className="erro__titulo">Essa página saiu da estante</h1>
            <p className="erro__texto">
                Não encontramos nada em <code>{pathname}</code>. O endereço pode estar
                errado ou a página foi removida.
            </p>

            <div className="erro__acoes">
                <Link className="erro__botao" to="/">
                    Explorar livros
                </Link>
                <Link className="erro__botao erro__botao--secundario" to="/estante">
                    Minha estante
                </Link>
            </div>
        </section>
    );
}

export default Erro;