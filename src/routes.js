import {BrowserRouter, Routes, Route} from 'react-router-dom'

import Home from './pages/Home';
import Livro from './pages/Livros';

function RoutesApp() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Home/> } />
                <Route path="/livro/:id" element={ <Livro/> } />
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;