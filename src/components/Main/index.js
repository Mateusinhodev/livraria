import './main.css';
import { Link } from 'react-router-dom';

function Main() {
    return(
        <>
            <div className='main'>
                <div className='row1'>
                    <h1>Um livro é uma porta aberta para mundos <br/> que só a imaginação pode alcançar</h1>
                </div>
                <div className='row2'>
                    <h2>Encontre seu livro</h2>
                    <div className='search'>
                        <input type='text' placeholder='Digite o nome do seu livro'/>
                        <button>Pesquisar</button>
                    </div>
                    <img src='./imagens/livrariavirtual.png'/>
                </div>
            </div>
        </>
    )
}

export default Main;