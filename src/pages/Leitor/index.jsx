import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import BarraProgresso from '../../components/BarraProgresso';
import { baixarTexto, dividirEmPaginas, prepararLivro } from '../../services/leitor';

import './leitor.css';

const TAMANHOS = [16, 18, 20, 22, 24]; // tamanhos de letra disponíveis (px)
const CHAVE_FONTE = 'livraria:leitor-fonte';

function lerFonteSalva() {
    try {
        const salvo = Number(localStorage.getItem(CHAVE_FONTE));
        return TAMANHOS.includes(salvo) ? salvo : 18;
    } catch {
        return 18; // navegador bloqueou o localStorage (ex.: modo privado)
    }
}

// Capa do livro: a imagem do Gutenberg ou, se não existir, uma capa gerada
function CapaLivro({ id, titulo, autor, totalPaginas, onComecar }) {
    const [semImagem, setSemImagem] = useState(false);
    const urlCapa = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`;

    return (
        <section className="leitor__capa">
            {semImagem ? (
                <div className="leitor__capa-gerada" aria-hidden="true">
                    <strong>{titulo}</strong>
                    {autor && <span>{autor}</span>}
                </div>
            ) : (
                <img
                    className="leitor__capa-imagem"
                    src={urlCapa}
                    alt={`Capa de ${titulo}`}
                    onError={() => setSemImagem(true)}
                />
            )}

            <h1>{titulo}</h1>
            {autor && <p className="leitor__capa-autor">{autor}</p>}
            <p className="leitor__capa-info">{totalPaginas} páginas · Domínio público · Project Gutenberg</p>

            <button type="button" className="leitor__comecar" onClick={onComecar}>
                Começar a ler
            </button>
        </section>
    );
}

// Parágrafo com itálico: no Gutenberg, _assim_ significa itálico
function Paragrafo({ texto }) {
    // O split com parênteses na regex guarda os trechos capturados:
    // "um _dois_ tres" → ["um ", "dois", " tres"]
    const partes = texto.split(/_([^_]+)_/g);

    return (
        <p>
            {partes.map((parte, indice) =>
                // Posições ímpares (1, 3, 5...) são os trechos que estavam entre _ _
                indice % 2 === 1 ? <em key={indice}>{parte}</em> : parte
            )}
        </p>
    );
}

function Leitor() {
    const { id } = useParams();
    const [params, setParams] = useSearchParams();

    const [livro, setLivro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [tentativa, setTentativa] = useState(0);
    const [fonte, setFonte] = useState(lerFonteSalva); // inicialização preguiçosa
    const topoRef = useRef(null);

    // 1. Baixa e prepara o livro
    useEffect(() => {
        let cancelado = false;
        setLoading(true);
        setErro('');

        baixarTexto(id)
            .then((texto) => {
                if (cancelado) return;
                setLivro(prepararLivro(texto));
                setLoading(false);
            })
            .catch((error) => {
                if (cancelado) return;
                console.error('Erro ao baixar o livro', error);
                setErro(
                    error.status === 404
                        ? 'Este livro não foi encontrado no Project Gutenberg.'
                        : 'Não foi possível baixar o livro. Verifique sua conexão e tente novamente.'
                );
                setLoading(false);
            });

        return () => {
            cancelado = true;
        };
    }, [id, tentativa]);

    // 2. Divide em páginas (só recalcula quando o livro muda)
    const paginas = useMemo(() => (livro ? dividirEmPaginas(livro.paragrafos) : []), [livro]);
    const total = paginas.length;

    // 0 = capa; de 1 até o total = páginas do texto
    const pagina = params.has('pagina')
        ? Math.min(Math.max(1, Number(params.get('pagina')) || 1), total)
        : 0;

    function irPara(numero) {
        if (numero < 0 || numero > total) return;
        // A capa (0) não precisa de ?pagina= na URL
        setParams(numero === 0 ? {} : { pagina: String(numero) }, { replace: true });
        topoRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    // 3. Setas do teclado viram a página
    useEffect(() => {
        function aoApertarTecla(evt) {
            if (evt.key === 'ArrowRight') irPara(pagina + 1);
            if (evt.key === 'ArrowLeft') irPara(pagina - 1);
        }

        window.addEventListener('keydown', aoApertarTecla);
        return () => window.removeEventListener('keydown', aoApertarTecla);
    });

    // 4. Guarda o tamanho da letra para a próxima visita
    useEffect(() => {
        try {
            localStorage.setItem(CHAVE_FONTE, String(fonte));
        } catch {
            // sem localStorage: a preferência só vale nesta visita
        }
    }, [fonte]);

    // 5. Título da aba do navegador
    useEffect(() => {
        if (livro) document.title = `${livro.titulo} | Livraria`;
        return () => {
            document.title = 'Livraria';
        };
    }, [livro]);

    if (loading) {
        return (
            <p className="aviso-carregando">
                Baixando o livro... Livros grandes podem levar alguns segundos.
            </p>
        );
    }

    if (erro) {
        return (
            <div className="leitor-aviso">
                <p>{erro}</p>
                <div className="leitor-aviso__acoes">
                    <button type="button" onClick={() => setTentativa((n) => n + 1)}>
                        Tentar novamente
                    </button>
                    <Link to="/classicos">Voltar aos clássicos</Link>
                </div>
            </div>
        );
    }

    const indiceFonte = TAMANHOS.indexOf(fonte);
    const progresso = total ? Math.round((pagina / total) * 100) : 0;

    return (
        <div className="leitor" ref={topoRef}>
            {/* Barra de ferramentas (fica presa no topo ao rolar) */}
            <div className="leitor__barra">
                <Link className="leitor__voltar" to="/classicos" aria-label="Voltar aos clássicos">
                    ←
                </Link>

                <div className="leitor__info">
                    <strong title={livro.titulo}>{livro.titulo}</strong>
                    {livro.autor && <span>{livro.autor}</span>}
                </div>

                <div className="leitor__fonte" role="group" aria-label="Tamanho da letra">
                    <button
                        type="button"
                        onClick={() => setFonte(TAMANHOS[indiceFonte - 1])}
                        disabled={indiceFonte === 0}
                        aria-label="Diminuir letra"
                    >
                        A−
                    </button>
                    <button
                        type="button"
                        onClick={() => setFonte(TAMANHOS[indiceFonte + 1])}
                        disabled={indiceFonte === TAMANHOS.length - 1}
                        aria-label="Aumentar letra"
                    >
                        A+
                    </button>
                </div>
            </div>

            <BarraProgresso valor={progresso} rotulo="Posição no livro" />

            {/* O texto da página */}
            <article className="leitor__texto" style={{ fontSize: `${fonte}px` }}>
                {pagina === 0 ? (
                    <CapaLivro
                        key={id}
                        id={id}
                        titulo={livro.titulo}
                        autor={livro.autor}
                        totalPaginas={total}
                        onComecar={() => irPara(1)}
                    />
                ) : (
                    <article className="leitor__texto" style={{ fontSize: `${fonte}px` }}>
                        {paginas[pagina - 1].map((paragrafo, indice) => (
                            <Paragrafo key={indice} texto={paragrafo} />
                        ))}
                    </article>
                )}
            </article>

            {/* Navegação */}
            <nav className="leitor__navegacao" aria-label="Páginas do livro">
                <button type="button" onClick={() => irPara(pagina - 1)} disabled={pagina <= 0}>
                    ← Anterior
                </button>
                <span>
                    {pagina === 0 ? `Capa · ${total} páginas` : `Página ${pagina} de ${total} · ${progresso}%`}
                </span>
                <button type="button" onClick={() => irPara(pagina + 1)} disabled={pagina >= total}>
                    Próxima →
                </button>
            </nav>
        </div>
    );
}

export default Leitor;