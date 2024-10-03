import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./favoritos.css"
import { toast } from "react-toastify";

function Favoritos() {

    const [livros, setLivros] = useState([])

    useEffect(()=> {

        const meusLivros= localStorage.getItem("@livraria");
        setLivros(JSON.parse(meusLivros) || [])
    }, [])

    function excluirLivro(id) {
        let filtroLivros = livros.filter((livro) => {
            return (livro.id !== id);
        });

        setLivros(filtroLivros);
        localStorage.setItem("@livraria", JSON.stringify(filtroLivros));
        toast.success("Livro removido com sucesso");

    }

    return (
        <div className="meus-livros">
            <h1>Meus Livros</h1>

            <ul>
                {livros.map((livro) => {
                    return(
                        <li key={livro.id}>
                            <span>{livro.volumeInfo.title}</span>
                            <div>
                                <Link to={`/livro/${livro.id}`}>Ver detalhes</Link>
                                <button onClick={() => excluirLivro(livro.id)}>Remover</button>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

export default Favoritos;

