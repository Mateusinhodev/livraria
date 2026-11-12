import './campo-busca.css';

// Cápsula de busca: lupa + campo + botão. Usada pelo Banner e pelos Clássicos.
// "onChange" recebe o TEXTO (não o evento); "onSubmit" recebe o evento do formulário.
function CampoBusca({ id, rotulo, placeholder, value, onChange, onSubmit, textoBotao = 'Pesquisar' }) {
    return (
        <form className="campo-busca" role="search" onSubmit={onSubmit}>
            <svg className="campo-busca__lupa" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </svg>

            <label htmlFor={id} className="visualmente-oculto">
                {rotulo}
            </label>
            <input
                id={id}
                type="search"
                className="campo-busca__input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            <button type="submit" className="botao botao--primario">
                {textoBotao}
            </button>
        </form>
    );
}

export default CampoBusca;