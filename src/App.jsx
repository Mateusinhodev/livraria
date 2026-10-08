import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RoutesApp from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { EstanteProvider } from './contexts/EstanteContext';

function App() {
    return (
        <AuthProvider>
            <EstanteProvider>
                <ToastContainer autoClose={3000} position="bottom-right" theme="colored" />
                <RoutesApp />
            </EstanteProvider>
        </AuthProvider>
    );
}

export default App;