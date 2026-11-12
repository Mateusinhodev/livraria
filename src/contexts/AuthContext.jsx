import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// O "quadro de avisos". Começa vazio (null).
const AuthContext = createContext(null);

// O Supabase responde os erros em inglês; traduzimos os mais comuns
function traduzirErro(error) {
    const msg = error?.message ?? '';

    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
    if (msg.includes('User already registered')) return 'Já existe uma conta com este e-mail.';
    if (msg.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (msg.toLowerCase().includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';

    return 'Não foi possível concluir. Tente novamente.';
}

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        // 1. Ao abrir o site: já existe uma sessão salva de uma visita anterior?
        supabase.auth.getSession().then(({ data }) => {
            setUsuario(data.session?.user ?? null);
            setCarregando(false);
        });

        // 2. Daqui pra frente: avise sempre que alguém entrar ou sair
        const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
            setUsuario(session?.user ?? null);
        });

        // 3. Ao desmontar: pare de ouvir
        return () => data.subscription.unsubscribe();
    }, []);

    async function entrar(email, senha) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw new Error(traduzirErro(error));
    }

    // Retorna true se a conta já está ativa, ou false se precisa confirmar o e-mail
    async function cadastrar(nome, email, senha) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: { nome },
                emailRedirectTo: window.location.origin,
            },
        });
        if (error) throw new Error(traduzirErro(error));
        return Boolean(data.session);
    }

    async function sair() {
        await supabase.auth.signOut();
    }

    // Tudo que fica "pendurado no quadro" para os componentes lerem
    const valor = { usuario, carregando, entrar, cadastrar, sair };

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
    return contexto;
}

// Nome para exibir: o informado no cadastro ou a parte antes do @
export function getNomeUsuario(usuario) {
    return usuario?.user_metadata?.nome || usuario?.email?.split('@')[0] || '';
}