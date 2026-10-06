import { useEffect, useState } from 'react';
import { getFavoritos, onFavoritosChange } from '../services/favoritos';

// Retorna a lista de favoritos e atualiza o componente sempre que ela mudar
function useFavoritos() {
    const [favoritos, setFavoritos] = useState(getFavoritos);

    useEffect(() => {
        return onFavoritosChange(() => setFavoritos(getFavoritos()));
    }, []);

    return favoritos;
}

export default useFavoritos;