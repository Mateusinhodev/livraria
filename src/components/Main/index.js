import './main.css';
import { useState } from 'react';

function Main({ onSearch }) {

    const [search, setSearch]= useState("");

    const handleSearch = (evt) => {
        if(evt.key==="Enter" || evt.type === "click") {
            onSearch(search); //Passa o valor da pesquisa para o componente pai Home
            console.log(search)
        }
    };

    // const searchBook=(evt)=>{
    //     if(evt.key==="Enter" || evt.type === "click") {
    //         onSearch(search); //Passa o valor da pesquisa para o componente pai Home
    //         console.log(search)
    //     }
    // }

    return(
        <>
            <div className='banner'>
                <div className='row1'></div>
                <div className='row2'>
                    <h2>Encontre seu livro</h2>
                    <div className='search'>
                        <input type='text' placeholder='Digite o nome do livro que procura...' value={search} onChange={e=>setSearch(e.target.value)} onKeyPress={handleSearch}/>
                        
                        <button onClick={handleSearch}>Pesquisar</button>
                    </div>
                    <img src='./imagens/livrariavirtual.png'/>
                </div>
            </div>
        </>
    )
}

export default Main;