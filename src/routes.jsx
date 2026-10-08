import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import RotaPrivada from './components/RotaPrivada';

import Entrar from './pages/Entrar';
import Home from './pages/Home';
import Livro from './pages/Livro';
import Favoritos from './pages/Favoritos';
import Estante from './pages/Estante';
import Erro from './pages/Erro';

function RoutesApp() {
    return (
        <BrowserRouter>
            <Header />

            <main>
                <Routes>
                    <Route path="/entrar" element={<Entrar />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/livro/:id" element={<Livro />} />
                    <Route path="/favoritos" element={<Favoritos />} />
                    <Route path="/estante" element={<RotaPrivada><Estante /></RotaPrivada>}/>

                    <Route path="*" element={<Erro />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default RoutesApp;