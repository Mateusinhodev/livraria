import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import RotaPrivada from './components/RotaPrivada';

import Home from './pages/Home';
import Livro from './pages/Livro';
import Entrar from './pages/Entrar';
import Estante from './pages/Estante';
import Classicos from './pages/Classicos';
import Leitor from './pages/Leitor';
import Erro from './pages/Erro';

function RoutesApp() {
    return (
        <BrowserRouter>
            <Header />

            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/livro/:id" element={<Livro />} />
                    <Route path="/entrar" element={<Entrar />} />
                    <Route
                        path="/estante"
                        element={
                            <RotaPrivada>
                                <Estante />
                            </RotaPrivada>
                        }
                    />
        
                    {/* Endereço antigo: os favoritos agora são uma aba da estante */}
                    <Route path="/favoritos" element={<Navigate to="/estante?aba=favoritos" replace />} />
                    <Route path="/classicos" element={<Classicos />} />
                    <Route path="/ler/:id" element={<Leitor />} />

                    <Route path="*" element={<Erro />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default RoutesApp;