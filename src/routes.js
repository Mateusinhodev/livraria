import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/Header';

import Home from './pages/Home';
import Livro from './pages/Livro';
import Favoritos from './pages/Favoritos';
import Erro from './pages/Erro';

function RoutesApp() {
    return (
        <BrowserRouter>
            <Header />

            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/livro/:id" element={<Livro />} />
                    <Route path="/favoritos" element={<Favoritos />} />

                    <Route path="*" element={<Erro />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default RoutesApp;