import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './livro-info.css'
import api from '../../services/api'

function Livro() {
    const { id } = useParams();
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
                console.log("FILME NAO ENCONTRADO")
            })
        }

        loadLivro()

        return () => {
            console.log("Componente foi desmontado")
        } 

    }, [])

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
                <button>Salvar</button>
                <button>
                    <a href="#">Resumos</a>
                </button>
            </div>
        </div>
    )
}

export default Livro;