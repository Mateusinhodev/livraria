import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './livro-info.css'
import api from '../../services/api'
import { toast } from "react-toastify";

function Livro() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [livro, setLivro] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLivro() {
            await api.get(`https://www.googleapis.com/books/v1/volumes/${id}`, {
                params: {
                    api_key: "AIzaSyDXg_R6YQRMJGUi6SrSuettnTzj7WWxOFQ",
                    language:"pt-BR",
                }
            })
            .then((response) => {
                setLivro(response.data);
                setLoading(false);
            })
            .catch(() => {
                console.log("FILME NAO ENCONTRADO");
                navigate("/", {replace: true})
                return;
            })
        }

        loadLivro()

        return () => {
            console.log("Componente foi desmontado")
        } 

    }, [navigate, id])

    function salvarLivro() {
        const meusLivros = localStorage.getItem("@livraria");

        let livrosSalvos = JSON.parse(meusLivros) || [];

        const hasLivro = livrosSalvos.some( (livroSalvo) => livroSalvo.id === livro.id);

        if(hasLivro) {
            toast.warn("Livro já está na lista de favoritos");
            return;
        }


        livrosSalvos.push(livro);
        localStorage.setItem("@livraria", JSON.stringify(livrosSalvos));
        toast.success("Livro salvo com sucesso");
    }

    if(loading) {
        return(
            <div className="livro-info">
                <h1>Carregando detalhes...</h1>
            </div>
        )
    }

    return (
        <div className="livro-info">
            <h1>{livro.volumeInfo.title}</h1>

            <img src={livro.volumeInfo.imageLinks.smallThumbnail}></img>

            <h3>Sinopse</h3>
            <span>{livro.volumeInfo.description}</span>

            <strong>Autor: {livro.volumeInfo.authors}</strong>

            <div className="area-buttons">
                <button onClick={salvarLivro}>Salvar</button>
                <button>
                    <a target="blank" rel="external" href={`https://www.google.com/search?tbm=bks&q=${livro.volumeInfo.title}`}>Livro</a>
                </button>
            </div>
        </div>
    )
}

export default Livro;