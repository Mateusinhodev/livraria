import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useAuth } from './AuthContext';
import { aplicarRegras, itemVazio, listarEstante, removerItem, salvarItem } from '../services/estante';

const EstanteContext = createContext(null);

export function EstanteProvider({ children }) {
    const { usuario } = useAuth();
    const userId = usuario?.id;

    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(false);

    // Carrega a estante sempre que alguém entra (ou troca de conta)
    useEffect(() => {
        // Ninguém logado: estante vazia
        if (!userId) {
            setItens([]);
            return;
        }

        let cancelado = false;
        setCarregando(true);

        listarEstante()
            .then((dados) => {
                if (!cancelado) setItens(dados);
            })
            .catch((error) => {
                console.error('Erro ao carregar a estante', error);
                if (!cancelado) toast.error('Não foi possível carregar sua estante.');
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        return () => {
            cancelado = true;
        };
    }, [userId]);

    // Procura um livro na estante (ou null, se não estiver)
    function getItem(livroId) {
        return itens.find((item) => item.livro_id === livroId) ?? null;
    }

    // Salva com atualização otimista.
    // base: dados do livro (livroParaItem); mudancas: só o que mudou, ex.: { status: 'lendo' }
    async function salvar(base, mudancas) {
        const anterior = itens; // ← cópia para poder desfazer
        const atual = getItem(base.livro_id);
        const novo = aplicarRegras({ ...base, ...atual }, mudancas);

        // Caso 1: sem status e sem favorito → o livro sai do banco
        if (itemVazio(novo)) {
            setItens((lista) => lista.filter((item) => item.livro_id !== novo.livro_id));
            try {
                if (atual) await removerItem(novo.livro_id);
            } catch (error) {
                setItens(anterior); // ← desfaz
                throw error;
            }
            return null;
        }

        // Caso 2: salva (cria ou atualiza)
        // 1º: muda a tela na hora, colocando o livro no topo da lista
        setItens((lista) => [novo, ...lista.filter((item) => item.livro_id !== novo.livro_id)]);

        try {
            // 2º: grava no banco e troca pela versão oficial (com id e datas do banco)
            const salvo = await salvarItem(userId, novo);
            setItens((lista) => lista.map((item) => (item.livro_id === salvo.livro_id ? salvo : item)));
            return salvo;
        } catch (error) {
            setItens(anterior); // ← desfaz
            throw error;
        }
    }

    const valor = { itens, carregando, getItem, salvar };

    return <EstanteContext.Provider value={valor}>{children}</EstanteContext.Provider>;
}

export function useEstante() {
    const contexto = useContext(EstanteContext);
    if (!contexto) throw new Error('useEstante precisa estar dentro de <EstanteProvider>');
    return contexto;
}