import {BrowserRouter, Routes, Route} from 'react-router-dom'

import Home from './pages/Home';
import Livro from './pages/Livros';
import Header from './components/Header';

function RoutesApp() {
    return(
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path="/" element={ <Home/> } />
                <Route path="/livro/:id" element={ <Livro/> } />
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;