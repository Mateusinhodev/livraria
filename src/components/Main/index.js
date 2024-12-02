import './main.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

function Main() {

    const [search, setSearch]=useState("");
    const searchBook=(evt)=>{
        if(evt.key==="Enter") {
            console.log("Hello!");
        }
    }
    return(
        <>
            <div className='main'>
                <div className='row1'></div>
                <div className='row2'>
                    <h2>Encontre seu livro</h2>
                    <div className='search'>
                        <input type='text' placeholder='Digite o nome do livro que procura...' value={search} onChange={e=>setSearch(e.target.value)} onKeyPress={searchBook}/>
                        
                        <button>Pesquisar</button>
                    </div>
                    <img src='./imagens/livrariavirtual.png'/>
                </div>
            </div>
        </>
    )
}

export default Main;