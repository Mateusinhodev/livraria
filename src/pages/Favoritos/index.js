import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./favoritos.css"

function Favoritos() {

    const [livros, setLivros] = useState([])

    useEffect(()=> {

        const meusLivros= localStorage.getItem("@livraria");
        setLivros(JSON.parse(meusLivros) || [])
    }, [])

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
                                <button>Excluir</button>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

export default Favoritos;

