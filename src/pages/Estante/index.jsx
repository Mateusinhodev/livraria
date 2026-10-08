import { getNomeUsuario, useAuth } from '../../contexts/AuthContext';

// Versão temporária: será construída de verdade na aula 8
function Estante() {
    const { usuario } = useAuth();

    return (
        <section className="aviso-carregando">
            <h1>Minha estante</h1>
            <p>Olá, {getNomeUsuario(usuario)}! Sua estante está em construção. 🚧</p>
        </section>
    );
}

export default Estante;