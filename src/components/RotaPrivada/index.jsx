import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Só mostra a página para quem está logado.
// Quem não está vai para /entrar e, depois do login, volta para onde estava.
function RotaPrivada({ children }) {
    const { usuario, carregando } = useAuth();
    const location = useLocation();

    // 1. Ainda verificando se existe uma sessão salva: espera
    if (carregando) {
        return <p className="aviso-carregando">Carregando...</p>;
    }

    // 2. Não está logado: vai para o login, lembrando de onde veio
    if (!usuario) {
        return <Navigate to="/entrar" replace state={{ de: location.pathname + location.search }} />;
    }

    // 3. Está logado: mostra a página
    return children;
}

export default RotaPrivada;