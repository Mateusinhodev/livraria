import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../../contexts/AuthContext';

import './entrar.css';

function Entrar() {
    const { usuario, carregando, entrar, cadastrar } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Para onde ir depois do login: a página de onde a pessoa veio, ou a Home
    const destino = location.state?.de || '/';

    const [modo, setModo] = useState('entrar'); // 'entrar' ou 'cadastrar'
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');
    const [confirmarEmail, setConfirmarEmail] = useState(false);

    // Quem já está logado não precisa ver esta página
    if (!carregando && usuario) {
        return <Navigate to={destino} replace />;
    }

    function trocarModo(novoModo) {
        setModo(novoModo);
        setErro('');
    }

    async function handleSubmit(evt) {
        evt.preventDefault();
        setErro('');
        setEnviando(true);

        try {
            if (modo === 'entrar') {
                await entrar(email.trim(), senha);
                toast.success('Bem-vindo de volta!');
                navigate(destino, { replace: true });
            } else {
                const ativa = await cadastrar(nome.trim(), email.trim(), senha);
                if (ativa) {
                    toast.success('Conta criada!');
                    navigate(destino, { replace: true });
                } else {
                    setConfirmarEmail(true);
                }
            }
        } catch (error) {
            setErro(error.message);
        } finally {
            setEnviando(false);
        }
    }

    // Tela mostrada depois do cadastro, quando é preciso confirmar o e-mail
    if (confirmarEmail) {
        return (
            <section className="entrar">
                <span className="entrar__icone" aria-hidden="true">✉️</span>
                <h1>Confirme seu e-mail</h1>
                <p className="entrar__texto">
                    Enviamos um link para <strong>{email}</strong>. Abra o e-mail e clique no link
                    para ativar sua conta. Depois é só entrar.
                </p>
                <button
                    type="button"
                    className="entrar__botao"
                    onClick={() => {
                        setConfirmarEmail(false);
                        trocarModo('entrar');
                    }}
                >
                    Ir para o login
                </button>
            </section>
        );
    }

    const cadastro = modo === 'cadastrar';

    return (
        <section className="entrar">
            <h1>{cadastro ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
            <p className="entrar__texto">Monte sua estante, acompanhe suas leituras e escreva resenhas.</p>

            <div className="entrar__modos" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={!cadastro}
                    className={!cadastro ? 'ativo' : ''}
                    onClick={() => trocarModo('entrar')}
                >
                    Entrar
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={cadastro}
                    className={cadastro ? 'ativo' : ''}
                    onClick={() => trocarModo('cadastrar')}
                >
                    Criar conta
                </button>
            </div>

            <form className="entrar__form" onSubmit={handleSubmit}>
                {cadastro && (
                    <label className="campo">
                        <span>Nome</span>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            autoComplete="name"
                            required
                            maxLength={60}
                        />
                    </label>
                )}

                <label className="campo">
                    <span>E-mail</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </label>

                <label className="campo">
                    <span>Senha</span>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        autoComplete={cadastro ? 'new-password' : 'current-password'}
                        minLength={6}
                        required
                    />
                    {cadastro && <small>Mínimo de 6 caracteres.</small>}
                </label>

                {erro && (
                    <p className="entrar__erro" role="alert">
                        {erro}
                    </p>
                )}

                <button type="submit" className="entrar__botao" disabled={enviando}>
                    {enviando ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'}
                </button>
            </form>
        </section>
    );
}

export default Entrar;