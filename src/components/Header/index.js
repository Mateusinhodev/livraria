import './header.css';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header>
            <Link className='logo' to="/">Livraria</Link>
            <Link className='livros_lidos'>Meus livros</Link>
        </header>
    )
}

export default Header;